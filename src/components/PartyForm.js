import React from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';
import apiService from '../service/apiService';
import { useNotification } from './NotificationProvider';

const initialPartyFormState = {
    partyName: '', description: '', panNumber: '', gstNumber: '',
    bankName: '', accountNo: '', ifscCode: '', branch: '', createdBy: ''
};

const partyFormFields = [
    {
        section: 'Party Information', fields: [
            { name: 'partyName', label: 'Party Name', required: true },
            { name: 'description', label: 'Description' },
            { name: 'panNumber', label: 'PAN Number', required: true },
            { name: 'gstNumber', label: 'GST Number' }
        ]
    },
    {
        section: 'Bank Details', fields: [
            { name: 'bankName', label: 'Bank Name' },
            { name: 'accountNo', label: 'Account No' },
            { name: 'ifscCode', label: 'IFSC Code' },
            { name: 'branch', label: 'Branch' },
            { name: 'createdBy', label: 'Created By' }
        ]
    }
];

const PartyForm = ({ form, setForm, errors, setErrors, isSubmitting, setIsSubmitting, editingId, handleClose, setPartyRows }) => {
    const { showNotification } = useNotification();
    const validateForm = () => {
        const newErrors = {};
        if (!form.partyName) newErrors.partyName = "Party Name is required";
        if (!form.panNumber) newErrors.panNumber = "PAN Number is required";
        else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(form.panNumber)) newErrors.panNumber = "PAN Number must be 10 characters (e.g., AAAAA9999A)";
        if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber)) newErrors.gstNumber = "GST Number must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) newErrors.ifscCode = "IFSC Code must be 11 characters (e.g., HDFC0000001)";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (isSubmitting) return;
        setIsSubmitting(true);
        const endpoint = '/party';
        const payload = { ...form };
        try {
            let response;
            if (editingId) {
                response = await apiService.patch(`${endpoint}/${editingId}`, payload);
                setPartyRows(prev => prev.map(row => row._id === response.data._id ? response.data : row));
                showNotification('Party updated successfully', 'success');
            } else {
                response = await apiService.post(endpoint, payload);
                setPartyRows(prev => [...prev, response.data]);
                showNotification('Party added successfully', 'success');
            }
            handleClose();
        } catch (error) {
            console.error('Error saving party:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save party. Please check the form data.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" sx={{ mt: 2 }} className="form-container">
            <Grid container spacing={2}>
                {partyFormFields.map(section => (
                    <Grid item xs={12} key={section.section}>
                        <Box
                            className="form-container"
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
                                        <TextField
                                            label={field.label}
                                            name={field.name}
                                            value={form[field.name] || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            required={field.required}
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name]}
                                            sx={{
                                                '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#ffffff' },
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                                                '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                                '& .MuiInputLabel-root': { color: '#6b7280' },
                                                '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                                                '& .MuiFormHelperText-root': { color: '#6b7280' },
                                            }}
                                        />
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



export default PartyForm;