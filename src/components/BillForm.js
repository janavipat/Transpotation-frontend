import React, { useEffect, useState } from 'react'; // ✅ Added useState
import { Box, Grid, TextField, Typography, MenuItem } from '@mui/material';
import apiService from '../service/apiService';
import { useNotification } from './NotificationProvider';

const initialBillFormState = {
    truckNo: '', from: '', to: '', deliveryAt: '', panNo: '', gstinNo: '',
    consignorName: '', consignorAddress: '', consignorGSTIN: '',
    consigneeName: '', consigneeAddress: '', consigneeGSTIN: '',
    partyDesc: '', valueOfGoods: '', invoiceChallan: '', consignmentNoteNo: '', consignmentDate: '',
    bankName: '', bankAcNo: '', ifscCode: '', branch: '',
    actualCharge: '', biltyCharges: '', grandTotal: '',
    name: '', billNo: '', date: '', stNo: '', chNo: '', lrNo: '', amount: '', total: '',
    partys: '', weight: '', description: '', gstNo: '', selectedPartyId: ''
};

const billFormFields = [
    {
        section: 'Truck Information', fields: [
            { name: 'selectedPartyId', label: 'Select Party', type: 'select', required: true },
            { name: 'truckNo', label: 'Truck No', required: true },
            { name: 'from', label: 'From', required: true },
            { name: 'to', label: 'To', required: true },
            { name: 'deliveryAt', label: 'Delivery At' },
            { name: 'panNo', label: 'PAN No' },
            { name: 'gstinNo', label: 'GSTIN No' }
        ]
    },
    {
        section: 'Consignor Details', fields: [
            { name: 'consignorName', label: 'Name', required: true },
            { name: 'consignorAddress', label: 'Address' },
            { name: 'consignorGSTIN', label: 'GSTIN' }
        ]
    },
    {
        section: 'Consignee Details', fields: [
            { name: 'consigneeName', label: 'Name', required: true },
            { name: 'consigneeAddress', label: 'Address' },
            { name: 'consigneeGSTIN', label: 'GSTIN' }
        ]
    },
    {
        section: 'Goods Details', fields: [
            { name: 'partys', label: 'No. of Articles', required: true },
            { name: 'description', label: 'Description', required: true },
            { name: 'weight', label: 'Weight' },
            { name: 'valueOfGoods', label: 'Value of Goods' },
            { name: 'invoiceChallan', label: 'Invoice/Challan' },
            { name: 'consignmentDate', label: 'Consignment Date', required: true },
            { name: 'gstNo', label: 'GST No' },
        ]
    },
    {
        section: 'Bank Owner Details', fields: [
            { name: 'bankName', label: 'Bank Name' },
            { name: 'bankAcNo', label: 'A/c No' },
            { name: 'ifscCode', label: 'IFSC Code' },
            { name: 'branch', label: 'Branch' }
        ]
    },
    {
        section: 'Charges', fields: [
            { name: 'actualCharge', label: 'Actual Charge' },
            { name: 'biltyCharges', label: 'Bilty Charges' },
            { name: 'grandTotal', label: 'Grand Total', required: true }
        ]
    },
    {
        section: 'Additional Details', fields: [
            { name: 'name', label: 'Name' },
            { name: 'billNo', label: 'Bill No', disabled: true }, // ✅ AUTO-GENERATED
            { name: 'date', label: 'Date' },
            { name: 'stNo', label: 'ST No' },
            { name: 'chNo', label: 'CH No' },
            { name: 'lrNo', label: 'LR No' },
            { name: 'amount', label: 'Amount' },
            { name: 'total', label: 'Total' }
        ]
    }
];

const BillForm = ({ form, setForm, errors, setErrors, isSubmitting, setIsSubmitting, editingId, handleClose, partyRows, setBillRows }) => {

    const { showNotification } = useNotification();
    
    // ✅ STATE TO TRACK IF BILL NO IS GENERATED
    const [billNoGenerated, setBillNoGenerated] = useState(false);

    // ✅ Auto-generate Bill number (if new)
    useEffect(() => {
        if (!editingId && !billNoGenerated) {
            setBillNoGenerated(true); // Prevent multiple calls
            apiService.get('/bill')
                .then(response => {
                    const billRecords = Array.isArray(response.data) ? response.data : response;
                    const latestBillNo = billRecords
                        .map(r => parseInt(r.billNo, 10))
                        .filter(n => !isNaN(n))
                        .sort((a, b) => b - a)[0] || 0;
                    const nextBillNo = (latestBillNo + 1).toString().padStart(4, '0');
                    
                    // ✅ ENSURE IT'S SET IN FORM
                    setForm(prev => ({ ...prev, billNo: nextBillNo }));
                    console.log('✅ Generated Bill No:', nextBillNo); // Debug
                })
                .catch(error => {
                    console.error('Failed to generate Bill No:', error);
                    showNotification('Failed to generate Bill No', 'error');
                    setBillNoGenerated(false);
                });
        }
    }, [editingId, setForm, showNotification, billNoGenerated]);

    const validateForm = () => {
        const newErrors = {};
        if (!form.truckNo) newErrors.truckNo = "Truck No is required";
        else if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(form.truckNo)) newErrors.truckNo = "Truck No must be in format XX12XX1234 (e.g., MH12AB1234)";
        if (!form.from) newErrors.from = "From is required";
        if (!form.to) newErrors.to = "To is required";
        if (!form.consignorName) newErrors.consignorName = "Consignor Name is required";
        if (!form.consigneeName) newErrors.consigneeName = "Consignee Name is required";
        if (!form.grandTotal) newErrors.grandTotal = "Grand Total is required";
        else if (isNaN(form.grandTotal) || Number(form.grandTotal) <= 0) newErrors.grandTotal = "Grand Total must be a positive number";
        
        // ✅ VALIDATE BILL NO FOR NEW RECORDS
        if (!editingId && !form.billNo) {
            newErrors.billNo = "Bill No is required";
        }
        
        if (form.panNo && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(form.panNo)) newErrors.panNo = "PAN No must be 10 characters (e.g., AAAAA9999A)";
        if (form.gstinNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstinNo)) newErrors.gstinNo = "GSTIN must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.consignorGSTIN && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.consignorGSTIN)) newErrors.consignorGSTIN = "Consignor GSTIN must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.consigneeGSTIN && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.consigneeGSTIN)) newErrors.consigneeGSTIN = "Consignee GSTIN must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.gstNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNo)) newErrors.gstNo = "GST No must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) newErrors.ifscCode = "IFSC Code must be 11 characters (e.g., HDFC0000001)";
        if (form.partys && (isNaN(form.partys) || Number(form.partys) <= 0)) newErrors.partys = "No. of Articles must be a positive number";
        if (form.weight && (isNaN(form.weight) || Number(form.weight) < 0)) newErrors.weight = "Weight must be a non-negative number";
        if (form.actualCharge && (isNaN(form.actualCharge) || Number(form.actualCharge) < 0)) newErrors.actualCharge = "Actual Charge must be a non-negative number";
        if (form.biltyCharges && (isNaN(form.biltyCharges) || Number(form.biltyCharges) < 0)) newErrors.biltyCharges = "Bilty Charges must be a non-negative number";
        if (form.amount && (isNaN(form.amount) || Number(form.amount) < 0)) newErrors.amount = "Amount must be a non-negative number";
        if (form.total && (isNaN(form.total) || Number(form.total) < 0)) newErrors.total = "Total must be a non-negative number";

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'selectedPartyId' && value) {
            const selectedParty = partyRows.find(party => party._id === value);
            if (selectedParty) {
                setForm(prev => ({
                    ...prev,
                    bankName: selectedParty.bankName || '',
                    gstNo: selectedParty.gstNumber || '',
                    description: selectedParty.description || '',
                    panNo: selectedParty.panNumber || '',
                    bankAcNo: selectedParty.accountNo || '',
                    ifscCode: selectedParty.ifscCode || '',
                    branch: selectedParty.branch || ''
                }));
            }
        }
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (isSubmitting) return;
        setIsSubmitting(true);
        const endpoint = '/bill';
        
        // ✅ ENSURE BILL NO IS IN PAYLOAD
        const payload = { ...form };
        console.log('🚚 PAYLOAD TO BACKEND:', payload); // Debug - Check Bill No here
        
        try {
            let response;
            if (editingId) {
                response = await apiService.patch(`${endpoint}/${editingId}`, payload);
                setBillRows(prev => prev.map(row => row._id === response.data._id ? response.data : row));
                showNotification('Bill updated successfully', 'success');
            } else {
                response = await apiService.post(endpoint, payload);
                setBillRows(prev => [...prev, response.data]);
                showNotification('Bill added successfully', 'success');
            }
            handleClose();
        } catch (error) {
            console.error('Error saving bill:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save bill. Please check the form data.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" sx={{ mt: 2 }} className="form-container">
            <Grid container spacing={2}>
                {billFormFields.map(section => (
                    <Grid item xs={12} key={section.section}>
                        <Box
                            className="form-section-grid"
                            sx={{
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                padding: { xs: '12px', sm: '16px' },
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                            }}
                        >
                            <Typography
                                variant="h6"
                                className="form-section-title"
                                sx={{
                                    fontFamily: '"Roboto", sans-serif',
                                    fontWeight: 500,
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                    color: '#1f2937',
                                    mb: 1.5,
                                    pb: 1,
                                    borderBottom: '2px solid #10b981',
                                }}
                            >
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
                                                sx={{
                                                    '& .MuiInputBase-root': {
                                                        borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '1rem',
                                                        height: '56px',
                                                        padding: '0 14px',
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                                    '& .MuiInputLabel-root': { color: '#6b7280' },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                                                    '& .MuiFormHelperText-root': { color: '#6b7280' },
                                                    '& .MuiSelect-select': { padding: '16.5px 14px' },
                                                    minWidth: '100%',
                                                }}
                                            >
                                                {partyRows.map((party) => (
                                                    <MenuItem key={party._id} value={party._id}>{party.partyName}</MenuItem>
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
                                                error={!!errors[field.name]}
                                                helperText={errors[field.name]}
                                                sx={{
                                                    '& .MuiInputBase-root': { 
                                                        borderRadius: '8px', 
                                                        backgroundColor: '#ffffff',
                                                        '&.Mui-disabled': {
                                                            backgroundColor: '#f9fafb',
                                                            WebkitTextFillColor: '#6b7280'
                                                        }
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                                    '& .MuiInputLabel-root': { color: '#6b7280' },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                                                    '& .MuiFormHelperText-root': { color: '#6b7280' },
                                                }}
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

export default BillForm;