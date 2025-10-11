import * as React from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Box, Divider, CircularProgress, Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiService from '../service/apiService';
import { styled } from '@mui/material/styles';

export const initialPartyFormState = {
    bankName: '',
    panNumber: '',
    partyName: '',
    description: '',
    createdBy: '',
    image: '',
    accountNo: '',
    ifscCode: '',
    branch: '',
    gstNumber: ''
};

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    maxWidth: '100%',
    overflowX: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
    margin: '24px auto',
    borderRadius: 4,
    border: '1px solid #A3D5FF',
}));

const StyledTable = styled(Table)(({ theme }) => ({
    minWidth: 1000,
    '& .MuiTableCell-head': {
        background: 'linear-gradient(2deg, #A3D5FF, #83C9F4)',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: '1.05rem',
        padding: '16px 20px',
        fontFamily: '"Roboto Condensed", sans-serif',
    },
    '& .MuiTableCell-body': {
        padding: '14px 20px',
        fontSize: '0.95rem',
        color: '#1F2A44',
        fontFamily: '"Roboto Condensed", sans-serif',
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: '#D9F0FF',
        },
    },
    '& .MuiTableCell-body.checkbox-cell': {
        width: '60px',
        padding: '14px 10px',
        textAlign: 'center',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#E6F0FA',
    },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 4,
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#D9F0FF',
        transform: 'scale(1)',
        transition: 'transform 0.3s ease-in-out',
        border: '1px solid #83C9F4',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            '& fieldset': { borderColor: '#A3D5FF' },
        },
        '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(131, 201, 244, 0.3)',
            '& fieldset': { borderColor: '#83C9F4', borderWidth: 2 },
        },
    },
    '& .MuiInputLabel-root': {
        color: '#1F2A44',
        fontWeight: 500,
        fontSize: '0.95rem',
        fontFamily: '"Roboto Condensed", sans-serif',
        '&.Mui-focused': { color: '#83C9F4' },
    },
    '& .MuiFormHelperText-root': {
        color: '#EF4444',
        fontFamily: '"Roboto Condensed", sans-serif',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 3,
    padding: theme.spacing(1, 4),
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    fontFamily: '"Roboto Condensed", sans-serif',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'scale(1.15)',
        backgroundColor: 'rgba(99, 165, 250, 0.1)',
    },
}));

export default function PartyTable({ rows = [], setRows, selectedRows, onRowSelection }) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [editIndex, setEditIndex] = React.useState(null);
    const [editForm, setEditForm] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState({});

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditForm(rows[index] || {}); // Added a safety check here as well
        setEditOpen(true);
        setErrors({});
    };

    const handleDelete = async (id, index) => {
        try {
            await apiService.delete(`/party/${id}`);
            setRows(prevRows => prevRows.filter((_, i) => i !== index));
            const rowId = rows[index]?._id || `row-${index}`;
            if (selectedRows.includes(rowId)) {
                onRowSelection(rowId);
            }
            alert('Party deleted successfully');
        } catch (error) {
            console.error("Error deleting party:", error.message);
            alert(error.response?.data?.message || error.message || "Failed to delete party");
        }
    };

    const handleCheckboxChange = (rowId) => {
        if (!rowId) {
            console.warn("Checkbox change ignored: rowId is undefined");
            return;
        }
        onRowSelection(rowId);
    };

    const handleSelectAll = () => {
        if (selectedRows.length === rows.length && rows.length > 0) {
            onRowSelection(null, true); // Deselect all
        } else {
            const rowIds = rows.map(row => row._id || `row-${rows.indexOf(row)}`);
            onRowSelection(rowIds, false); // Select all
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

        if (!editForm.bankName) newErrors.bankName = "Bank Name is required";
        if (!editForm.panNumber) {
            newErrors.panNumber = "PAN Number is required";
        } else if (!panRegex.test(editForm.panNumber)) {
            newErrors.panNumber = "PAN must be 10 characters (e.g., AAAAA9999A)";
        }
        if (!editForm.packageName) newErrors.packageName = "Package Name is required";
        if (!editForm.partyName) newErrors.partyName = "Party Name is required";
        if (editForm.ifscCode && !ifscRegex.test(editForm.ifscCode)) {
            newErrors.ifscCode = "IFSC code format is invalid (e.g., SBIN0001234)";
        }
        if (editForm.gstNumber && !gstRegex.test(editForm.gstNumber)) {
            newErrors.gstNumber = "GSTIN format is invalid (e.g., 09AABCU9603G1Z1)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const payload = { ...editForm };
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') delete payload[key];
            });
            const updatedParty = await apiService.patch(`/party/${editForm._id}`, payload);
            const updatedRows = [...rows];
            updatedRows[editIndex] = updatedParty.data || updatedParty;
            setRows(updatedRows);
            setEditOpen(false);
            alert('Party updated successfully');
        } catch (error) {
            console.error("Error updating party:", error.message);
            alert(error.response?.data?.message || error.message || "Failed to update party");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableFields = [
        { key: 'partyName', label: 'Party Name' },
        { key: 'packageName', label: 'Package Name' },
        { key: 'bankName', label: 'Bank Name' },
        { key: 'panNumber', label: 'PAN' },
        { key: 'accountNo', label: 'Account No' },
        { key: 'ifscCode', label: 'IFSC Code' },
        { key: 'branch', label: 'Branch' },
        { key: 'gstNumber', label: 'GSTIN' },
        { key: 'description', label: 'Description' },
        { key: 'createdBy', label: 'Created By' },
        { key: 'createdAt', label: 'Created At' },
    ];

    const formFields = [
        {
            section: 'Party Information', fields: [
                { name: 'partyName', label: 'Party Name', required: true },
                { name: 'packageName', label: 'Package Name', required: true },
                { name: 'description', label: 'Description', required: false },
                { name: 'image', label: 'Image URL', required: false },
                { name: 'createdBy', label: 'Created By', required: false },
            ]
        },
        {
            section: 'Bank & Tax Information', fields: [
                { name: 'bankName', label: 'Bank Name', required: true },
                { name: 'accountNo', label: 'Account No', required: false },
                { name: 'ifscCode', label: 'IFSC Code', required: false },
                { name: 'branch', label: 'Branch', required: false },
                { name: 'panNumber', label: 'PAN Number', required: true },
                { name: 'gstNumber', label: 'GSTIN', required: false },
            ]
        }
    ];

    return (
        <>
            <StyledTableContainer component={Paper}>
                <StyledTable stickyHeader aria-label="party table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="checkbox-cell">
                                <Checkbox
                                    checked={selectedRows.length === rows.length && rows.length > 0}
                                    indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                                    onChange={handleSelectAll}
                                    inputProps={{ 'aria-label': 'Select all parties' }}
                                />
                            </TableCell>
                            <TableCell>S.No</TableCell>
                            {tableFields.map((field) => (
                                <TableCell key={field.key}>{field.label}</TableCell>
                            ))}
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => {
                            const rowId = row._id || `row-${idx}`;
                            return (
                                <StyledTableRow key={row._id || idx}>
                                    <TableCell className="checkbox-cell">
                                        <Checkbox
                                            checked={selectedRows.includes(rowId)}
                                            onChange={() => handleCheckboxChange(rowId)}
                                            inputProps={{ 'aria-label': `Select party ${row.partyName || idx + 1}` }}
                                        />
                                    </TableCell>
                                    <TableCell>{idx + 1}</TableCell>
                                    {tableFields.map((field) => (
                                        <TableCell key={field.key}>
                                            {field.key === 'createdAt' ?
                                                new Date(row[field.key]).toLocaleString() :
                                                row[field.key] || '-'}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                                            <StyledIconButton sx={{ color: '#83C9F4' }} onClick={() => handleEdit(idx)}>
                                                <EditIcon />
                                            </StyledIconButton>
                                            <StyledIconButton sx={{ color: '#EF4444' }} onClick={() => handleDelete(row._id, idx)}>
                                                <DeleteIcon />
                                            </StyledIconButton>
                                        </Box>
                                    </TableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>

            <StyledDialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{
                    bgcolor: '#83C9F4',
                    color: '#FFFFFF',
                    py: 3,
                    borderRadius: '4px 4px 0 0',
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    fontFamily: '"Roboto Condensed", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    Edit Party
                </DialogTitle>
                <DialogContent dividers sx={{
                    py: 4,
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    maxHeight: '70vh',
                    overflowY: 'auto'
                }}>
                    {formFields.map(({ section, fields }) => (
                        <Box key={section} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{
                                mb: 2,
                                fontWeight: 600,
                                color: '#1F2A44',
                                fontFamily: '"Roboto Condensed", sans-serif'
                            }}>
                                {section}
                            </Typography>
                            <Divider sx={{ mb: 3, bgcolor: '#A3D5FF', height: '2px' }} />
                            <Grid container spacing={3}>
                                {fields.map(field => (
                                    <Grid item xs={12} sm={6} key={field.name}>
                                        <StyledTextField
                                            fullWidth
                                            label={field.label}
                                            name={field.name}
                                            value={editForm[field.name] || ''}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required={field.required}
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name]}
                                            size="small"
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions sx={{
                    p: 3,
                    bgcolor: '#FFFFFF',
                    borderRadius: '0 0 4px 4px',
                    gap: 2
                }}>
                    <StyledButton
                        onClick={() => setEditOpen(false)}
                        sx={{ px: 4, bgcolor: '#6B7280', color: '#FFFFFF', '&:hover': { bgcolor: '#4B5563' } }}
                    >
                        Cancel
                    </StyledButton>
                    <StyledButton
                        variant="contained"
                        onClick={handleSave}
                        disabled={isSubmitting}
                        sx={{ px: 4, bgcolor: '#83C9F4', '&:hover': { bgcolor: '#60A5FA' } }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </StyledButton>
                </DialogActions>
            </StyledDialog>
        </>
    );
}