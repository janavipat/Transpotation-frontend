import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Typography, MenuItem } from '@mui/material';
import apiService from '../service/apiService';
import { useNotification } from './NotificationProvider';

// ====================== INITIAL STATE ======================
const initialLRFormState = {
  lrNo: '',
  truckNo: '',
  from: '',
  to: '',
  date: '',
  consignorName: '',
  consignorAddress: '',
  consignorGSTIN: '',
  consigneeName: '',
  consigneeAddress: '',
  consigneeGSTIN: '',
  selectedPartyId: '',
  partys: '',
  weight: '',
  description: '',
  rate: '',
  totalFreight: '',
  billNo: '',
  valueOfGoods: '',
  deliveryAt: '',
  gstPaidBy: '',
  grossWeight: '',
  tareWeight: '',
  netWeight: '',
  biltyCharge: '',
  hamali: '',
  lessAdvance: '',
  grandTotal: ''
};

// ====================== FORM FIELDS ======================
const lrFormFields = [
  {
    section: 'LR Information',
    fields: [
      { name: 'selectedPartyId', label: 'Select Party', type: 'select', required: true },
      { name: 'lrNo', label: 'LR No', required: true, disabled: true },
      { name: 'truckNo', label: 'Truck No', required: true },
      { name: 'from', label: 'From', required: true },
      { name: 'to', label: 'To', required: true },
      { name: 'date', label: 'Date', required: true, type: 'date' },
      { name: 'billNo', label: 'Bill No' }
    ]
  },
  {
    section: 'Consignor Details',
    fields: [
      { name: 'consignorName', label: 'Consignor Name', required: true },
      { name: 'consignorAddress', label: 'Consignor Address' },
      { name: 'consignorGSTIN', label: 'Consignor GSTIN' }
    ]
  },
  {
    section: 'Consignee Details',
    fields: [
      { name: 'consigneeName', label: 'Consignee Name', required: true },
      { name: 'consigneeAddress', label: 'Consignee Address' },
      { name: 'consigneeGSTIN', label: 'Consignee GSTIN' }
    ]
  },
  {
    section: 'Goods Details',
    fields: [
      { name: 'partys', label: 'No. of Articles', required: true },
      { name: 'description', label: 'Description', required: true },
      { name: 'weight', label: 'Weight' }
    ]
  },
  {
    section: 'Charges Details',
    fields: [
      { name: 'rate', label: 'Rate' },
      { name: 'totalFreight', label: 'Total Freight' },
      { name: 'valueOfGoods', label: 'Goods Value Rs' },
      { name: 'deliveryAt', label: 'Delivery At' },
      { name: 'gstPaidBy', label: 'GST Paid By' },
      { name: 'grossWeight', label: 'G.Wt.' },
      { name: 'tareWeight', label: 'T.Wt.' },
      { name: 'netWeight', label: 'N.Wt.' },
      { name: 'biltyCharge', label: 'Bilty Charge' },
      { name: 'hamali', label: 'Hamali' },
      { name: 'lessAdvance', label: 'Less Adv.' },
      { name: 'grandTotal', label: 'Grand Total' }
    ]
  }
];

// ====================== MAIN COMPONENT ======================
const LRForm = ({
  form,
  setForm,
  errors,
  setErrors,
  isSubmitting,
  setIsSubmitting,
  editingId,
  handleClose,
  partyRows: propPartyRows,
  setLrRows
}) => {
  const { showNotification } = useNotification();
  const [localPartyRows, setLocalPartyRows] = useState([]);

  // ✅ Fetch party data if not passed via props
  useEffect(() => {
    if (!Array.isArray(propPartyRows) || propPartyRows.length === 0) {
      apiService.get('/party')
        .then(response => {
          const data = response.data || response;
          if (Array.isArray(data) && data.length > 0) {
            setLocalPartyRows(data);
          } else {
            showNotification('No Party records found', 'warning');
          }
        })
        .catch(error => {
          console.error('Error fetching parties:', error);
          showNotification('Failed to fetch Party records', 'error');
        });
    } else {
      setLocalPartyRows(propPartyRows);
    }
  }, [propPartyRows, showNotification]);

  // ✅ Determine which party list to use
  const partiesToUse = localPartyRows;

  // ✅ Auto-generate LR number (if new)
  useEffect(() => {
    if (!editingId) {
      apiService.get('/lr')
        .then(response => {
          const lrRecords = Array.isArray(response.data) ? response.data : response;
          const latestLrNo = lrRecords
            .map(r => parseInt(r.lrNo, 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => b - a)[0] || 0;
          const nextLrNo = (latestLrNo + 1).toString().padStart(4, '0');
          setForm(prev => ({ ...prev, lrNo: nextLrNo }));
        })
        .catch(() => showNotification('Failed to generate LR No', 'error'));
    }
  }, [editingId, setForm, showNotification]);

  // ✅ Handle Field Changes (including auto-fill)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'selectedPartyId') {
      const selectedParty = partiesToUse.find(p => p._id === value);

      if (selectedParty) {
        setForm(prev => ({
          ...prev,
          selectedPartyId: value,
          consignorName: selectedParty.partyName || '',
          consignorAddress: selectedParty.address || '',
          consignorGSTIN: selectedParty.gstNumber || ''
        }));
      } else {
        // Reset fields if no party selected
        setForm(prev => ({
          ...prev,
          selectedPartyId: '',
          consignorName: '',
          consignorAddress: '',
          consignorGSTIN: ''
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error for that field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ✅ Save function (Create or Update)
  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = { ...form };
      const endpoint = '/lr';
      let response;

      if (editingId) {
        response = await apiService.patch(`${endpoint}/${editingId}`, payload);
        setLrRows(prev => prev.map(r => r._id === response.data._id ? response.data : r));
        showNotification('LR updated successfully', 'success');
      } else {
        response = await apiService.post(endpoint, payload);
        setLrRows(prev => [...prev, response.data]);
        showNotification('LR added successfully', 'success');
      }

      handleClose();
    } catch (error) {
      console.error('Error saving LR:', error);
      showNotification(error.response?.data?.message || 'Failed to save LR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================== RENDER ======================
  return (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {lrFormFields.map(section => (
          <Grid item xs={12} key={section.section}>
            <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                p: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <Typography variant="h6" sx={{
                borderBottom: '2px solid #10b981',
                pb: 1,
                mb: 2,
                color: '#1f2937'
              }}>
                {section.section}
              </Typography>

              <Grid container spacing={2}>
                {section.fields.map(field => (
                  <Grid item xs={12} sm={6} key={field.name}>
                    {field.type === 'select' ? (
                      <TextField
                        select
                        label={field.label}
                        name={field.name}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        fullWidth
                        required={field.required}
                        error={!!errors[field.name]}
                        helperText={errors[field.name]}
                      >
                        <MenuItem value="">
                          <em>Select a Party</em>
                        </MenuItem>
                        {partiesToUse.map(party => (
                          <MenuItem key={party._id} value={party._id}>
                            {party.partyName}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        label={field.label}
                        name={field.name}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        fullWidth
                        required={field.required}
                        disabled={field.disabled}
                        type={field.type === 'date' ? 'date' : 'text'}
                        InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                        error={!!errors[field.name]}
                        helperText={errors[field.name]}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LRForm;
