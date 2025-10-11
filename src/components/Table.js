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
import { toast } from 'react-toastify';


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
    minWidth: 1200,
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
        backgroundColor: '#D9F0FF',
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

export default function BillTable({ rows, setRows, selectedRows, onRowSelection }) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [editIndex, setEditIndex] = React.useState(null);
    const [editForm, setEditForm] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState({});

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditForm(rows[index]);
        setEditOpen(true);
        setErrors({});
    };

    const handleDelete = async (id, index) => {
        try {
            await apiService.delete(`/bill/${id}`);
            setRows(prevRows => prevRows.filter((_, i) => i !== index));
            const rowId = rows[index].billNo || rows[index]._id || `row-${index}`;
            if (selectedRows.includes(rowId)) {
                onRowSelection(rowId);
            }
toast.success(`${view} deleted successfully`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });        } catch (error) {
            console.error("Error deleting bill:", error.message);
           toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const handleCheckboxChange = (rowId) => {
        if (!rowId) {
            console.warn("Checkbox change ignored: rowId is undefined");
            return;
        }
        console.log("Toggling row:", rowId);
        onRowSelection(rowId);
    };

    const handleSelectAll = () => {
        if (selectedRows.length === rows.length && rows.length > 0) {
            console.log("Deselecting all rows");
            onRowSelection(null, true); // Deselect all
        } else {
            const rowIds = rows.map(row => row.billNo || row._id || `row-${rows.indexOf(row)}`);
            console.log("Selecting all rows:", rowIds);
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

        if (!editForm.truckNo) {
            newErrors.truckNo = "Truck No is required";
        } else if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(editForm.truckNo)) {
            newErrors.truckNo = "Truck No must be in format XX12XX1234 (e.g., MH12AB1234)";
        }

        if (!editForm.from) newErrors.from = "From is required";
        if (!editForm.to) newErrors.to = "To is required";
        if (!editForm.consignorName) newErrors.consignorName = "Consignor Name is required";
        if (!editForm.consigneeName) newErrors.consigneeName = "Consignee Name is required";
        if (!editForm.date) {
            newErrors.date = "Date is required";
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(editForm.date)) {
            newErrors.date = "Date must be in YYYY-MM-DD format";
        }

        if (editForm.weight && (isNaN(editForm.weight) || Number(editForm.weight) <= 0)) {
            newErrors.weight = "Weight must be a positive number";
        }

        if (editForm.amount && (isNaN(editForm.amount) || Number(editForm.amount) <= 0)) {
            newErrors.amount = "Amount must be a positive number";
        }

        if (editForm.packages && (isNaN(editForm.packages) || Number(editForm.packages) <= 0)) {
            newErrors.packages = "Packages must be a positive number";
        }

        if (editForm.pan && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(editForm.pan)) {
            newErrors.pan = "PAN must be 10 characters (e.g., AAAAA9999A)";
        }

        if (editForm.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1}$/.test(editForm.gstin)) {
            newErrors.gstin = "GSTIN must be 15 characters (e.g., 22AAAAA9999A1ZZ)";
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
            if (payload.weight) payload.weight = Number(payload.weight);
            if (payload.amount) payload.amount = Number(payload.amount);
            if (payload.packages) payload.packages = Number(payload.packages);
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') delete payload[key];
            });
            const updatedbill = await apiService.patch(`/bill/${editForm._id}`, payload);
            const updatedRows = [...rows];
            updatedRows[editIndex] = updatedbill.data || updatedbill;
            setRows(updatedRows);
            setEditOpen(false);
            toast.success(`${view} added successfully`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
        } catch (error) {
            console.error("Error updating bill:", error.message);
           toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableFields = [
        { key: 'truckNo', label: 'Truck No' },
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'weight', label: 'Weight' },
        { key: 'invoiceNo', label: 'Invoice No' },
        { key: 'challanNo', label: 'Challan No' },
        { key: 'gstin', label: 'GSTIN' },
        { key: 'pan', label: 'PAN' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
        { key: 'billNo', label: 'bill No' }
    ];

    const formFields = [
        {
            section: 'bill Information', fields: [
                { name: 'truckNo', label: 'Truck No', required: true },
                { name: 'from', label: 'From', required: true },
                { name: 'to', label: 'To', required: true },
                { name: 'date', label: 'Date', required: true },
                { name: 'billNo', label: 'bill No' }
            ]
        },
        {
            section: 'Consignor Details', fields: [
                { name: 'consignorName', label: 'Consignor Name', required: true },
                { name: 'consignorAddress', label: 'Consignor Address' }
            ]
        },
        {
            section: 'Consignee Details', fields: [
                { name: 'consigneeName', label: 'Consignee Name', required: true },
                { name: 'consigneeAddress', label: 'Consignee Address' }
            ]
        },
        {
            section: 'Goods Details', fields: [
                { name: 'description', label: 'Description' },
                { name: 'packages', label: 'Packages' },
                { name: 'weight', label: 'Weight' },
                { name: 'invoiceNo', label: 'Invoice No' },
                { name: 'challanNo', label: 'Challan No' }
            ]
        },
        {
            section: 'Additional Details', fields: [
                { name: 'gstin', label: 'GSTIN' },
                { name: 'pan', label: 'PAN' },
                { name: 'amount', label: 'Amount' }
            ]
        }
    ];

    return (
        <>
            <StyledTableContainer component={Paper}>
                <StyledTable stickyHeader aria-label="bill table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="checkbox-cell">
                                <Checkbox
                                    checked={selectedRows.length === rows.length && rows.length > 0}
                                    indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                                    onChange={handleSelectAll}
                                    inputProps={{ 'aria-label': 'Select all bills' }}
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
                            const rowId = row.billNo || row._id || `row-${idx}`;
                            return (
                                <StyledTableRow key={row._id || idx}>
                                    <TableCell className="checkbox-cell">
                                        <Checkbox
                                            checked={selectedRows.includes(rowId)}
                                            onChange={() => handleCheckboxChange(rowId)}
                                            inputProps={{ 'aria-label': `Select bill ${row.billNo || idx + 1}` }}
                                        />
                                    </TableCell>
                                    <TableCell>{idx + 1}</TableCell>
                                    {tableFields.map((field) => (
                                        <TableCell key={field.key}>{row[field.key] || '-'}</TableCell>
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

            <StyledDialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="lg" fullWidth>
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
                    Edit bill
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
                                    <Grid item xs={12} sm={6} md={4} key={field.name}>
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