import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Typography, Divider, CircularProgress,
    ToggleButtonGroup, ToggleButton, MenuItem, Select,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Checkbox, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import { toast } from 'react-toastify';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiService from '../service/apiService';
import Header from './Header';
import ganesh from '../images/logo.png';
import sign from '../images/Sign.png'

const initialBillFormState = {
    truckNo: '', from: '', to: '', deliveryAt: '', panNo: '', gstinNo: '',chno:"",
    consignorName: '', consignorAddress: '', consignorGSTIN: '',
    consigneeName: '', consigneeAddress: '', consigneeGSTIN: '',
    partyDesc: '', valueOfGoods: '', invoiceChallan: '', consignmentNoteNo: '', consignmentDate: '',
    bankName: '', bankAcNo: '', ifscCode: '', branch: '',
    actualCharge: '', biltyCharges: '', grandTotal: '',
    name: '', billNo: '', date: '', stNo: '', chNo: '', lrNo: '', amount: '', total: '',
    partys: '',  description: '', gstNo: '', selectedPartyId: '', selectedLrId: ''
};

const initialLRFormState = {
    truckNo: '', from: '', to: '', date: '', consignorName: '', consignorAddress: '', consignorGSTIN: '',
    consigneeName: '', consigneeAddress: '', consigneeGSTIN: '', partys: '', weight: '', description: '',
    rate: '', totalFreight: '', billNo: '', valueOfGoods: '', deliveryAt: '', gstPaidBy: '',
    grossWeight: '', tareWeight: '', netWeight: '', biltyCharge: '', hamali: '', lessAdvance: '', grandTotal: ''
};

const initialpartyFormState = {
    bankName: '', panNumber: '', partyName: '', description: '', createdBy: '', image: '', accountNo: '', ifscCode: '', branch: '', gstNumber: ''
};

const billFormFields = [
    {
        section: 'Truck Information', fields: [
            { name: 'selectedPartyId', label: 'Select Party', type: 'select', required: false },
            { name: 'selectedLrId', label: 'Select LR', type: 'select', required: true },
            { name: 'truckNo', label: 'Truck No', required: true },
            { name: 'from', label: 'From', required: true },
            { name: 'to', label: 'To', required: true },
            { name: 'deliveryAt', label: 'Delivery At' },
            { name: 'date', label: 'Date' },
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
    // {
    //     section: 'Consignee Details', fields: [
    //         { name: 'consigneeName', label: 'Name', required: true },
    //         { name: 'consigneeAddress', label: 'Address' },
    //         { name: 'consigneeGSTIN', label: 'GSTIN' }
    //     ]
    // },
    {
        section: 'Goods Details', fields: [
            // { name: 'partys', label: 'No. of Articles', required: true },
            { name: 'description', label: 'Description', required: true },
            { name: 'valueOfGoods', label: 'Value of Goods' },
            // { name: 'invoiceChallan', label: 'Invoice/Challan' },
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
            { name: 'grandTotal', label: 'Grand Total', required: true },
            { name: 'IGSTCGST', label: 'IGST/CGST' },
            { name: 'SGST', label: 'SGST' },

        ]
    },
    {
        section: 'Additional Details', fields: [
            // { name: 'name', label: 'Name' },
            // { name: 'billNo', label: 'Bill No', disabled: true }, // ✅ AUTO-GENERATED            
            { name: 'stNo', label: 'ST No' },
            { name: 'chNo', label: 'CH No' },
            { name: 'amount', label: 'Amount' },
            // { name: 'total', label: 'Total' }
        ]
    }
];

const lrFormFields = [
    {
        section: 'LR Information', fields: [
            { name: 'selectedPartyId', label: 'Select Party', type: 'select', required: true },
            { name: 'truckNo', label: 'Truck No', required: true },
            { name: 'from', label: 'From', required: true },
            { name: 'to', label: 'To', required: true },
            { name: 'date', label: 'Date', required: true },
            { name: 'billNo', label: 'Bill No' }
        ]
    },
    {
        section: 'Consignor Details', fields: [
            { name: 'consignorName', label: 'Consignor Name', required: true },
            { name: 'consignorAddress', label: 'Consignor Address' },
            { name: 'consignorGSTIN', label: 'Consignor GSTIN' }
        ]
    },
    // {
    //     section: 'Consignee Details', fields: [
    //         { name: 'consigneeName', label: 'Consignee Name', required: true },
    //         { name: 'consigneeAddress', label: 'Consignee Address' },
    //         { name: 'consigneeGSTIN', label: 'Consignee GSTIN' }
    //     ]
    // },
    {
        section: 'Goods Details', fields: [
            // { name: 'partys', label: 'Partys', required: true },
            { name: 'description', label: 'Description', required: true },
            // { name: 'weight', label: 'Weight' },
            // { name: 'rate', label: 'Rate' },
            { name: 'totalFreight', label: 'Total Freight' },
            { name: 'valueOfGoods', label: 'Value of Goods' }
        ]
    },
    {
        section: 'Weight Details', fields: [
            { name: 'grossWeight', label: 'Gross Weight' },
            { name: 'tareWeight', label: 'Tare Weight' },
            { name: 'netWeight', label: 'Net Weight' }
        ]
    },
    {
        section: 'Charges & Delivery', fields: [
            { name: 'deliveryAt', label: 'Delivery At' },
            { name: 'gstPaidBy', label: 'GST Paid By' },
            { name: 'biltyCharge', label: 'Bilty Charge' },
            { name: 'hamali', label: 'Hamali' },
            { name: 'lessAdvance', label: 'Less Advance' },
            { name: 'grandTotal', label: 'Grand Total' }
        ]
    }
];

const partyFormFields = [
    {
        section: 'Party Information', fields: [
            { name: 'bankName', label: 'Bank Name', required: true },
            { name: 'panNumber', label: 'PAN Number', required: true },
            { name: 'partyName', label: 'Party Name', required: true },
            { name: 'description', label: 'Description' },
            { name: 'createdBy', label: 'Created By' },
            // { name: 'image', label: 'Image URL' },
            { name: 'accountNo', label: 'Account No' },
            { name: 'ifscCode', label: 'IFSC Code' },
            { name: 'branch', label: 'Branch' },
            { name: 'gstNumber', label: 'GST Number' },
            { name: 'Address', label: 'Address' },
        ]
    }
];

const Home = () => {
    const [view, setView] = useState('bill');
    const [open, setOpen] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [billRows, setBillRows] = useState([]);
    const [lrRows, setLrRows] = useState([]);
    const [partyRows, setpartyRows] = useState([]);
    const [selectedBillRows, setSelectedBillRows] = useState([]);
    const [selectedLrRows, setSelectedLrRows] = useState([]);
    const [selectedpartyRows, setSelectedpartyRows] = useState([]);
    const [form, setForm] = useState(initialBillFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [printMode, setPrintMode] = useState(null);
    const [shouldPrint, setShouldPrint] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [billNoGenerated, setBillNoGenerated] = useState(false);

    const handleViewChange = (event, newView) => {
        if (newView) {
            setView(newView);
            setForm(
                newView === 'bill' ? initialBillFormState :
                    newView === 'lr' ? initialLRFormState :
                        initialpartyFormState
            );
            setErrors({});
            setSelectedBillRows([]);
            setSelectedLrRows([]);
            setSelectedpartyRows([]);
            setEditingId(null);
        }
    };

    const handleDeleteSelected = async () => {
        const selectedRows = view === 'bill' ? selectedBillRows : view === 'lr' ? selectedLrRows : selectedpartyRows;
        if (selectedRows.length === 0) {
            toast.warn(`Please select at least one ${view} record to delete.`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected ${view}(s)?`)) {
            return;
        }

        setIsSubmitting(true);
        const endpoint = `/${view}`;
        try {
            await Promise.all(selectedRows.map(id => apiService.delete(`${endpoint}/${id}`)));
            if (view === 'bill') {
                setBillRows(prev => prev.filter(row => !selectedRows.includes(String(row._id))));
                setSelectedBillRows([]);
            } else if (view === 'lr') {
                setLrRows(prev => prev.filter(row => !selectedRows.includes(String(row._id))));
                setSelectedLrRows([]);
            } else {
                setpartyRows(prev => prev.filter(row => !selectedRows.includes(String(row._id))));
                setSelectedpartyRows([]);
            }
            toast.success(`${selectedRows.length} ${view}(s) deleted successfully`, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error(`Error deleting ${view}s:`, error);
            toast.error(`Failed to delete selected ${view}s`, {
                position: "top-right",
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

    useEffect(() => {
        const img = new Image();
        img.src = ganesh;
        img.onload = () => console.log('Image preloaded successfully');
        img.onerror = () => console.error('Failed to preload image');
    }, []);

    // ✅ ADD THIS ENTIRE useEffect
    useEffect(() => {
        if (view === 'bill' && !editingId && !billNoGenerated && open) {
            setBillNoGenerated(true);
            apiService.get('/bill')
                .then(response => {
                    const billRecords = Array.isArray(response.data) ? response.data : response;
                    const latestBillNo = billRecords
                        .map(r => parseInt(r.billNo, 10))
                        .filter(n => !isNaN(n))
                        .sort((a, b) => b - a)[0] || 0;
                    const nextBillNo = (latestBillNo + 1).toString().padStart(4, '0');
                    setForm(prev => ({ ...prev, billNo: nextBillNo }));
                    console.log('✅ Generated Bill No:', nextBillNo);
                })
                .catch(error => {
                    console.error('Failed to generate Bill No:', error);
                    toast.error('Failed to generate Bill No');
                    setBillNoGenerated(false);
                });
        }
    }, [view, editingId, open, billNoGenerated]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bills, lrs, parties] = await Promise.all([
                    apiService.get("/bill"),
                    apiService.get("/lr"),
                    apiService.get("/party")
                ]);
                setBillRows(Array.isArray(bills) ? bills.filter(item => item && item._id) : []);
                setLrRows(Array.isArray(lrs) ? lrs.filter(item => item && item._id) : []);
                setpartyRows(Array.isArray(parties) ? parties.filter(item => item && item._id) : []);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error(err, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        };
        fetchData();
    }, []);

    

    useEffect(() => {
        if (shouldPrint && printMode) {
            const recordsToPrint = printMode === 'all'
                ? (view === 'bill' ? billRows : view === 'lr' ? lrRows : partyRows)
                : (view === 'bill'
                    ? billRows.filter(row => selectedBillRows.includes(String(row._id)))
                    : view === 'lr'
                        ? lrRows.filter(row => selectedLrRows.includes(String(row._id)))
                        : partyRows.filter(row => selectedpartyRows.includes(String(row._id))));
            if (recordsToPrint.length === 0) {
                toast.warn(`No ${view === 'bill' ? 'bill' : view === 'lr' ? 'LR' : 'party'} records available to print.`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setShouldPrint(false);
                setPrintMode(null);
                return;
            }
             setTimeout(() => {
                window.print();
                setShouldPrint(false);
                setPrintMode(null);
            }, 500);
        }
    }, [printMode, shouldPrint, selectedBillRows, selectedLrRows, selectedpartyRows, billRows, lrRows, partyRows, view]);

    const handleOpen = () => {
    setEditingId(null);
    setForm(view === 'bill' ? initialBillFormState : view === 'lr' ? initialLRFormState : initialpartyFormState);
    setErrors({});
    setOpen(true);
    if (view === 'bill') setBillNoGenerated(false); // ✅ ADD
};

    const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(initialBillFormState);
    setErrors({});
    setBillNoGenerated(false); // ✅ ADD
};
  const numberToWords = (num) => {
    if (!num) return "";
    const ones = [
      "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
      "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
      "sixteen", "seventeen", "eighteen", "nineteen",
    ];
    const tens = [
      "", "", "twenty", "thirty", "forty", "fifty",
      "sixty", "seventy", "eighty", "ninety",
    ];

    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " hundred" +
          (n % 100 ? " " + convert(n % 100) : "")
        );
      if (n < 1000000)
        return (
          convert(Math.floor(n / 1000)) +
          " thousand" +
          (n % 1000 ? " " + convert(n % 1000) : "")
        );
      if (n < 1000000000)
        return (
          convert(Math.floor(n / 1000000)) +
          " million" +
          (n % 1000000 ? " " + convert(n % 1000000) : "")
        );
      return "number too large";
    };

    return convert(parseInt(num)).trim();
  };
    const handleEdit = (row, tableType) => {
    if (!row || !row._id) {
        console.error('Invalid row data for editing');
        return;
    }
    setEditingId(row._id);
    setBillNoGenerated(true);
    const formState = { ...row };
    delete formState.__v;
    delete formState._id;
    delete formState.createdAt;
    delete formState.updatedAt;

    // Map lrNo to selectedLrId by finding the matching LR record
    if (tableType === 'bill' && row.lrNo) {
        const matchingLr = lrRows.find(lr => lr.lrNo === row.lrNo);
        formState.selectedLrId = matchingLr ? matchingLr._id : '';
    } else {
        formState.selectedLrId = '';
    }

    setForm(formState);
    setOpen(true);
};

    const handlePrintDialogOpen = () => setPrintDialogOpen(true);

    const handlePrintDialogClose = () => {
        setPrintDialogOpen(false);
        setPrintMode(null);
    };

    const handlePrint = () => {
        setPrintMode('all');
        setPrintDialogOpen(false);
        setShouldPrint(true);
    };

    const handlePrintSelected = () => {
        const selectedCount = view === 'bill' ? selectedBillRows.length : view === 'lr' ? selectedLrRows.length : selectedpartyRows.length;
        if (selectedCount === 0) {
            toast.warn(`Please select at least one ${view === 'bill' ? 'bill' : view === 'lr' ? 'LR' : 'party'} record to print.`, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        setPrintMode('selected');
        setPrintDialogOpen(false);
        setShouldPrint(true);
    };

    const handleRowSelection = (rowId, isDeselectAll = false) => {
        if (view === 'bill') {
            if (isDeselectAll) setSelectedBillRows([]);
            else if (Array.isArray(rowId)) setSelectedBillRows([...new Set(rowId.filter(id => id && id.trim()))]);
            else if (rowId) setSelectedBillRows(prev => prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...new Set([...prev, rowId])]);
        } else if (view === 'lr') {
            if (isDeselectAll) setSelectedLrRows([]);
            else if (Array.isArray(rowId)) setSelectedLrRows([...new Set(rowId.filter(id => id && id.trim()))]);
            else if (rowId) setSelectedLrRows(prev => prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...new Set([...prev, rowId])]);
        } else {
            if (isDeselectAll) setSelectedpartyRows([]);
            else if (Array.isArray(rowId)) setSelectedpartyRows([...new Set(rowId.filter(id => id && id.trim()))]);
            else if (rowId) setSelectedpartyRows(prev => prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...new Set([...prev, rowId])]);
        }
    };

    const validateForm = () => {
    const newErrors = {};
    if (view === 'bill') {
        if (!form.truckNo) newErrors.truckNo = "Truck No is required";
        else if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(form.truckNo)) newErrors.truckNo = "Truck No must be in format XX12XX1234 (e.g., MH12AB1234)";

        if (!form.from) newErrors.from = "From is required";
        if (!form.to) newErrors.to = "To is required";
        if (!form.consignorName) newErrors.consignorName = "Consignor Name is required";
        // if (!form.consigneeName) newErrors.consigneeName = "Consignee Name is required";

        if (!form.grandTotal) newErrors.grandTotal = "Grand Total is required";
        else if (isNaN(form.grandTotal) || Number(form.grandTotal) <= 0) newErrors.grandTotal = "Grand Total must be a positive number";

        if (form.panNo && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(form.panNo)) newErrors.panNo = "PAN No must be 10 characters (e.g., AAAAA9999A)";
        if (form.gstinNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstinNo)) newErrors.gstinNo = "GSTIN must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.consignorGSTIN && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.consignorGSTIN)) newErrors.consignorGSTIN = "Consignor GSTIN must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        // if (form.consigneeGSTIN && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.consigneeGSTIN)) newErrors.consigneeGSTIN = "Consignee GSTIN must be 15 characters (e.g., 22AAAAA9999A1Z5)";
        if (form.gstNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNo)) newErrors.gstNo = "GST No must be 15 characters (e.g., 22AAAAA9999A1Z5)";

        if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) newErrors.ifscCode = "IFSC Code must be 11 characters (e.g., HDFC0000001)";
        
        if (form.partys && (isNaN(form.partys) || Number(form.partys) <= 0)) newErrors.partys = "Partys must be a positive number";
        if (form.weight && (isNaN(form.weight) || Number(form.weight) < 0)) newErrors.weight = "Weight must be a non-negative number";
        if (form.actualCharge && (isNaN(form.actualCharge) || Number(form.actualCharge) < 0)) newErrors.actualCharge = "Actual Charge must be a non-negative number";
        if (form.biltyCharges && (isNaN(form.biltyCharges) || Number(form.biltyCharges) < 0)) newErrors.biltyCharges = "Bilty Charges must be a non-negative number";
        if (form.amount && (isNaN(form.amount) || Number(form.amount) < 0)) newErrors.amount = "Amount must be a non-negative number";
        if (form.total && (isNaN(form.total) || Number(form.total) < 0)) newErrors.total = "Total must be a non-negative number";
        if (!form.selectedPartyId) newErrors.selectedPartyId = "Party selection is required";
        if (!form.selectedLrId) newErrors.selectedLrId = "LR selection is required";
    }
    setErrors(newErrors);
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
                accountNo: selectedParty.accountNo || '',
                ifscCode: selectedParty.ifscCode || '',
                branch: selectedParty.branch || ''
            }));
        }
    } else if (name === 'selectedLrId' && value) {
        const selectedLr = lrRows.find(lr => lr._id === value);
        if (selectedLr) {
            setForm(prev => ({
                ...prev,
                lrNo: selectedLr.lrNo || ''
            }));
        }
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
};

    const handleSave = async () => {
        if (!validateForm()) return;
        if (isSubmitting) return;
        setIsSubmitting(true);

        const endpoint = view === 'bill' ? '/bill' : view === 'lr' ? '/lr' : '/party';
        const payload = { ...form };
        
        if (view === 'lr') {
            const numericFields = ['weight', 'rate', 'totalFreight', 'valueOfGoods', 'grossWeight', 'tareWeight', 'netWeight', 'biltyCharge', 'hamali', 'lessAdvance', 'grandTotal'];
            numericFields.forEach(field => {
                if (payload[field] && payload[field] !== '') {
                    payload[field] = Number(payload[field]);
                }
            });
        } else if (view === 'bill') {
            const numericFields = ['partys', 'weight', 'actualCharge', 'biltyCharges', 'grandTotal', 'amount', 'total'];
            numericFields.forEach(field => {
                if (payload[field] && payload[field] !== '') {
                    payload[field] = Number(payload[field]);
                }
            });
        }

        const updateState = (newRecord) => {
            if (view === 'bill') setBillRows(prev => prev.map(row => row._id === newRecord._id ? newRecord : row));
            else if (view === 'lr') setLrRows(prev => prev.map(row => row._id === newRecord._id ? newRecord : row));
            else setpartyRows(prev => prev.map(row => row._id === newRecord._id ? newRecord : row));
        };

        const addState = (newRecord) => {
            if (view === 'bill') setBillRows(prev => [...prev, newRecord]);
            else if (view === 'lr') setLrRows(prev => [...prev, newRecord]);
            else setpartyRows(prev => [...prev, newRecord]);
        };

        try {
            let response;
            if (editingId) {
                response = await apiService.patch(`${endpoint}/${editingId}`, payload);
                updateState(response);
                toast.success(`${view} updated successfully`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                response = await apiService.post(endpoint, payload);
                addState(response);
                toast.success(`${view} added successfully`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
            handleClose();
        } catch (error) {
            console.error(`Error saving ${view}:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to save ${view}. Please check the form data.`;
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

    const handleDelete = async (id, tableType) => {
        if (!id) {
            console.error('Invalid ID for deletion');
            return;
        }
        if (window.confirm(`Are you sure you want to delete this ${tableType}?`)) {
            try {
                await apiService.delete(`/${tableType}/${id}`);
                if (tableType === 'bill') setBillRows(billRows.filter(row => row._id !== id));
                else if (tableType === 'lr') setLrRows(lrRows.filter(row => row._id !== id));
                else if (tableType === 'party') setpartyRows(partyRows.filter(row => row._id !== id));
                toast.success(`${view} deleted successfully`, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } catch (error) {
                console.error(`Error deleting ${tableType}:`, error);
                toast.error(error, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    };

    const renderTable = (rows, selectedRows, type) => {
        if (!rows || !Array.isArray(rows)) {
            return (
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography>No data available</Typography>
                </Paper>
            );
        }
    const isItemSelected = (id) => selectedRows.indexOf(id) !== -1;

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n._id).filter(id => id);
            handleRowSelection(newSelecteds);
        } else {
            handleRowSelection([], true);
        }
    };

    const handleCheckboxClick = (event, id) => {
        handleRowSelection(id);
    };

    let headers = [];
    let rowCells = (row) => [];

    if (type === 'bill') {
        headers = ['Bill No', 'LR No', 'Truck No', 'From', 'To', 'Date', 'Grand Total', 'Actions'];
        rowCells = (row) => [
            row.billNo || '-', row.lrNo || '-', row.truckNo, row.from, row.to,
            row.consignmentDate || '-', row.grandTotal
        ];
    } else if (type === 'lr') {
        headers = ['LR No', 'Truck No', 'From', 'To', 'Consignor', 'Consignee', 'Partys', 'Weight', 'Total Freight', 'Grand Total', 'Actions'];
        rowCells = (row) => [
            row.lrNo || '-', row.truckNo, row.from, row.to, row.consignorName,
            row.consigneeName, row.partys || '-', row.weight || '-', row.totalFreight || '-', row.grandTotal || '-'
        ];
    } else if (type === 'party') {
        headers = ['Party Name', 'PAN Number', 'GST Number', 'Bank Name', 'Account No', 'IFSC Code', 'Actions'];
        rowCells = (row) => [
            row.partyName, row.panNumber, row.gstNumber || '-', row.bankName || '-',
            row.accountNo || '-', row.ifscCode || '-'
        ];
    }

    return (
        <Paper
            sx={{
                width: '100%',
                mb: 2,
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
            }}
        >
            <TableContainer sx={{ maxHeight: '600px', overflowX: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: '650px' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                padding="checkbox"
                                sx={{
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #d1d5db',
                                    padding: { xs: '8px', sm: '12px' },
                                    '& .MuiCheckbox-root': {
                                        color: '#6b7280',
                                        '&.Mui-checked': {
                                            color: '#10b981',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                        },
                                    },
                                }}
                            >
                                <Checkbox
                                    indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                                    checked={rows.length > 0 && selectedRows.length === rows.length}
                                    onChange={handleSelectAllClick}
                                    sx={{ padding: '4px' }}
                                />
                            </TableCell>
                            {headers.map((header) => (
                                <TableCell
                                    key={header}
                                    sx={{
                                        fontFamily: '"Roboto", sans-serif',
                                        fontWeight: 600,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        color: '#1f2937',
                                        backgroundColor: '#f8fafc',
                                        borderBottom: '1px solid #d1d5db',
                                        padding: { xs: '8px', sm: '12px' },
                                        whiteSpace: 'nowrap',
                                        textAlign: header === 'Actions' ? 'center' : 'left',
                                        display: { xs: header === 'GST Number' || header === 'Account No' ? 'none' : 'table-cell', sm: 'table-cell' },
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => {
                            if (!row || !row._id) return null;
                            const isSelected = isItemSelected(row._id);
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    tabIndex={-1}
                                    key={row._id}
                                    selected={isSelected}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(16, 185, 129, 0.04)',
                                        },
                                    }}
                                >
                                    <TableCell
                                        padding="checkbox"
                                        sx={{
                                            borderBottom: '1px solid #e5e7eb',
                                            padding: { xs: '8px', sm: '12px' },
                                            '& .MuiCheckbox-root': {
                                                color: '#6b7280',
                                                '&.Mui-checked': {
                                                    color: '#10b981',
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                                },
                                            },
                                        }}
                                        onClick={(event) => handleCheckboxClick(event, row._id)}
                                    >
                                        <Checkbox checked={isSelected} sx={{ padding: '4px' }} />
                                    </TableCell>
                                    {rowCells(row).map((cell, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{
                                                fontFamily: '"Roboto", sans-serif',
                                                fontWeight: 400,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                color: '#1f2937',
                                                borderBottom: '1px solid #e5e7eb',
                                                padding: { xs: '8px', sm: '12px' },
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: { xs: '100px', sm: '150px' },
                                                display: {
                                                    xs:
                                                        headers[index] === 'GST Number' || headers[index] === 'Account No'
                                                            ? 'none'
                                                            : 'table-cell',
                                                    sm: 'table-cell',
                                                },
                                            }}
                                        >
                                            {cell || '-'}
                                        </TableCell>
                                    ))}
                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid #e5e7eb',
                                            padding: { xs: '8px', sm: '12px' },
                                            textAlign: 'center',
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(row, type)}
                                            // ✅ REPLACE TextField sx prop
sx={{
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        '&.Mui-disabled': {  // ✅ ADD THIS
            backgroundColor: '#f9fafb',
            WebkitTextFillColor: '#6b7280',
        }
    },
}}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(row._id, type)}
                                            sx={{
                                                color: '#dc2626',
                                                '&:hover': {
                                                    color: '#b91c1c',
                                                    backgroundColor: 'rgba(220, 38, 38, 0.08)',
                                                },
                                                '&:focus': {
                                                    outline: '2px solid #dc2626',
                                                    outlineOffset: '2px',
                                                },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {rows.length === 0 && (
                <Box
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid #e5e7eb',
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 400,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            color: '#6b7280',
                        }}
                    >
                        {`No ${type} data available.`}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

const renderPrintRecord = (record, type) => {
    if (type === 'party') {
        return (
            <Box key={record._id} className="bill-container">
                <Box className="print-header">
                    <div className="header-top-line">
                        ॥ श्री गणेशाय नमः ॥
                    </div>
                    <div className="header-main-grid">
                        <div className="logo-section">
                            <img src={ganesh} alt="Ganpati God Logo" width="100" height="100" />
                            <div className="logo-text-block">
                                <span className="logo-main-text">ANGAD</span>
                                <span className="logo-sub-text">FREIGHT</span>
                                <span className="logo-main-text">CARRIERS</span>
                            </div>
                        </div>
                        <div className="company-details-section">
                            <div className="company-name">SHRI VINAYAK ROADWAYS</div>
                            <div className="company-tagline"><h4>CARGO MOVERS & TRANSPORT CONTRACTOR & FLEET OWNER</h4></div>
                            <div className="company-address">1, Ashirwad Estate, Near Umiya Kanta, Aslali By Pass Road, Aslali, Ahmedabad-382427</div>
                            <div className="company-contact">E-mail: <b>Svraslali@gmail.com</b></div>
 <div className="contact-row">
    <div className="company-contact">Mobile: <b>9898147837</b></div>
    <div className="company-contact">UIP ID: <b>8320539296</b></div>
  </div>

                        </div>
                        <div className="bill-info-section">
                            <div className="info-cell party-name-cell">Party Name :</div>
                            <div className="info-cell data-cell">{record.partyName || '-'}</div>
                            <div className="info-cell date-cell">Date :</div>
                            <div className="info-cell data-cell">{new Date(record.createdAt).toLocaleDateString('en-CA') || '-'}</div>
                            <div className="info-cell static-cell">PAN NO: 24AFKPB7580D1ZN</div>
                            <div className="info-cell static-cell">GST NO: AFKPB7580D</div>
                        </div>
                    </div>
                </Box>
                <div className="party-details-section">
                    <div className="party-block">
                        <div className="party-header">Party Details :</div>
                        <div className="party-details">
                            <div><strong>Bank Name:</strong> {record.bankName || '-'}</div>
                            <div><strong>PAN Number:</strong> {record.panNumber || '-'}</div>
                            <div><strong>GST Number:</strong> {record.gstNumber || '-'}</div>
                            <div><strong>Description:</strong> {record.description || '-'}</div>
                            <div><strong>Account No:</strong> {record.accountNo || '-'}</div>
                            <div><strong>IFSC Code:</strong> {record.ifscCode || '-'}</div>
                            <div><strong>Branch:</strong> {record.branch || '-'}</div>
                            <div><strong>Created By:</strong> {record.createdBy || '-'}</div>
                        </div>
                    </div>
                </div>
                <div className="final-footer">
                    <div className="disclaimer-box">
                        Party details provided are for record purposes only. SHRI VINAYAK ROADWAYS is not responsible for any discrepancies in the provided information. All financial transactions are subject to verification.
                    </div>
                    <div className="jurisdiction-line">
                        <span className="jurisdiction-text">Subject To Vapi Jurisdiction</span>
                        <span className="jurisdiction-text">For SHRI VINAYAK ROADWAYS</span>
                    </div>
                </div>
            </Box>
        );
    }

    const printDate = record.consignmentDate || record.date || new Date().toLocaleDateString('en-CA');
    const isBill = type === 'bill';

    return (
        <Box key={record._id} className="bill-container">
            <Box className="print-header">
                <div className="header-top-line">
                    ॥ श्री गणेशाय नमः ॥
                </div>
                <div className="header-main-grid">
                    <div className="logo-section">
                        <img src={ganesh} alt="Ganpati God Logo" width="100" height="100" />
                    </div>
                    <div className="company-details-section">
                        <div className="company-name">SHRI VINAYAK ROADWAYS</div>
                        <div className="company-tagline"><h4>CARGO MOVERS & TRANSPORT CONTRACTOR & FLEET OWNER</h4></div>
                        <div className="company-address">1, Ashirwad Estate, Near Umiya Kanta, Aslali By Pass Road, Aslali, Ahmedabad-382427</div>
                        <div className="company-contact">E-mail: <b>Svraslali@gmail.com</b></div>
 <div className="contact-row">
    <div className="company-contact">Mobile: <b>9898147837</b></div>
    <div className="company-contact">UIP ID: <b>8320539296</b></div>
  </div>
                    </div>
                    <div className="bill-info-section">
                        <div className="info-cell lr-no-cell">Bill.No. :</div>
                        <div className="info-cell data-cell">{record.billNo || '-'}</div>
                        <div className="info-cell truck-no-cell">Truck No. :</div>
                        <div className="info-cell data-cell">{record.truckNo || '-'}</div>
                        <div className="info-cell date-cell">Date :</div>
                        <div className="info-cell data-cell">{new Date().toLocaleDateString()}</div>
                        <div className="info-cell static-cell">PAN NO: 24AFKPB7580D1ZN</div>
                        <div className="info-cell static-cell">GST NO: AFKPB7580D</div>
                    </div>
                </div>
            </Box>
            <div className="consignor-consignee-section">
                <div className="consignor-block">
                    <div className="consignor-header"> Name & Address :</div>
                    <div className="consignor-details">
                        <div>Name:  {record.consignorName || '-'}</div>
                        <div>Address: {record.consignorAddress || '-'}</div>
                    </div>
                    <div className="gst-no"><b>GST No. : {record.consignorGSTIN || record.gstNo || '-'}</b></div>
                </div>
                <div className="mid-info-block">
                    <div className="location-info">
                        <div className="location-name">{record.from || '-'}</div>
                        <div className="location-divider"></div>
                        <div className="location-label">TO</div>
                    </div>
                    <div className="location-info">
                        <div className="location-name">{record.to || '-'}</div>
                        <div className="location-divider"></div>
                        {/* <div className="location-label">To</div> */}
                    </div>
                </div>
                {/* <div className="consignee-block">
                    <div className="consignee-header">Consignee's Name & Address :</div>
                    <div className="consignee-details">
                        <div>{record.consigneeName || '-'}</div>
                        <div>{record.consigneeAddress || '-'}</div>
                    </div>
                    <div className="gst-no">GST No. : {record.consigneeGSTIN || record.gstNo || '-'}</div>
                </div> */}
            </div>
            <table className="goods-table">
                <thead>
                    <tr>
                        <th className="no-articles-col">Bill Date</th>
                        <th className="description-col">Natural of Goods Said to Contain</th>
                        <th className="weight-col">Ch. No.</th>
                        <th className="rate-col">L.R. No.</th>
                         <th className="rate-col">Truck No.</th>
                        <th className="total-freight-col">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="no-articles-col">
<div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
  {new Date(record.createdAt || new Date()).toLocaleDateString('en-GB')}
</div>                        </td>
                        <td className="description-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.description || '-'}</div>
                        </td>
                        <td className="weight-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.chNo|| '0.00'}</div>
                        </td>
                        <td className="rate-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.lrNo || '-'}</div>
                        </td>
                         <td className="rate-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.truckNo || '-'}</div>
                        </td>
                        <td className="total-freight-col">
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '3px' }}>
                                {record.total| '0.00'}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="charges-footer-grid">
                <div className="left-charges-block">
                    <div className="charge-row">
                        <span className="charge-label">IGST/CGST:</span>
                        <span className="charge-data" style={{marginLeft:"200px;"}}>{record.IGSTCGST || '-'}</span>
                    </div>
                    
                    
                </div>
                <div className="mid-charges-block">
                    <div className="charge-row">
                        <span className="charge-label">SGST:</span>
                        <span className="charge-data">{record.SGST || '0.00'}</span>
                    </div>
                    
                </div>
                <div className="right-charges-block">
                    <div className="charge-row">
                        <span className="charge-label">Total:</span>
                        <span className="charge-data">{record.grandTotal || 0}</span>
                    </div>
                </div>
            </div>
            <div className="disclaimer-box">
                 <span className="charge-label">Rupees:</span>
                <span className="charge-data">{numberToWords(record.grandTotal)}</span>
                 </div>
            <div className="final-footer">
                
                <div className="jurisdiction-line">
                
                <div className="footer">
                    <div className="charge-ro">
                        <span className="charge-labe">bank Name:</span>
                        <span className="charge-data">{'ICICI' || '-'}</span>
                    </div>
                    <div className="charge-ro">
                        <span className="charge-labe">A.c. No:</span>
                        <span className="charge-data">{624405039633 || '0.00'}</span>
                    </div>
                    <div className="charge-ro">
                        <span className="charge-labe">IFSC Code:</span>
                        <span className="charge-data">{'ICICI0006244'} </span>
                    </div>               
                    
                </div>                
              
                
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-45px',marginLeft: '270px' }}>
                        <img src={sign} alt="Signature" style={{ width: '120px', height: '80px', marginBottom: '10px' }} />
                        <span className="jurisdiction-text">For SHRI VINAYAK ROADWAYS</span>
                    </div>
                </div>
            </div>
        </Box>
    );
};
const renderPrintRecordofLR = (record, type) => {
    if (type === 'party') {
        return (
            <Box key={record._id} className="bill-container">
                <Box className="print-header">
                    <div className="header-top-line">
                        ॥ श्री गणेशाय नमः ॥
                    </div>
                    <div className="header-main-grid">
                        <div className="logo-section">
                            <img src={ganesh} alt="Ganpati God Logo" width="100" height="100" />
                            <div className="logo-text-block">
                                <span className="logo-main-text">ANGAD</span>
                                <span className="logo-sub-text">FREIGHT</span>
                                <span className="logo-main-text">CARRIERS</span>
                            </div>
                        </div>
                        <div className="company-details-section">
                            <div className="company-name">SHRI VINAYAK ROADWAYS</div>
                            <div className="company-tagline"><h4>CARGO MOVERS & TRANSPORT CONTRACTOR & FLEET OWNER</h4></div>
                            <div className="company-address">1, Ashirwad Estate, Near Umiya Kanta, Aslali By Pass Road, Aslali, Ahmedabad-382427</div>
                            <div className="company-contact">E-mail: Svraslali@gmail.com</div>
                        </div>
                        <div className="bill-info-section">
                            <div className="info-cell party-name-cell">Party Name :</div>
                            <div className="info-cell data-cell">{record.partyName || '-'}</div>
                            <div className="info-cell date-cell">Date :</div>
                            <div className="info-cell data-cell">{new Date(record.createdAt).toLocaleDateString('en-CA') || '-'}</div>
                            <div className="info-cell static-cell">PAN NO: 24AFKPB7580D1ZN</div>
                            <div className="info-cell static-cell">GST NO: AFKPB7580D</div>
                        </div>
                    </div>
                </Box>
                <div className="party-details-section">
                    <div className="party-block">
                        <div className="party-header">Party Details :</div>
                        <div className="party-details">
                            <div><strong>Bank Name:</strong> {record.bankName || '-'}</div>
                            <div><strong>PAN Number:</strong> {record.panNumber || '-'}</div>
                            <div><strong>GST Number:</strong> {record.gstNumber || '-'}</div>
                            <div><strong>Description:</strong> {record.description || '-'}</div>
                            <div><strong>Account No:</strong> {record.accountNo || '-'}</div>
                            <div><strong>IFSC Code:</strong> {record.ifscCode || '-'}</div>
                            <div><strong>Branch:</strong> {record.branch || '-'}</div>
                            <div><strong>Created By:</strong> {record.createdBy || '-'}</div>
                        </div>
                    </div>
                </div>
                <div className="final-footer">
                    <div className="disclaimer-box">
                        Party details provided are for record purposes only. SHRI VINAYAK ROADWAYS is not responsible for any discrepancies in the provided information. All financial transactions are subject to verification.
                    </div>
                    <div className="jurisdiction-line">
                        <span className="jurisdiction-text">Subject To Vapi Jurisdiction</span>
                        <span className="jurisdiction-text">For SHRI VINAYAK ROADWAYS</span>
                    </div>
                </div>
            </Box>
        );
    }

    const printDate = record.consignmentDate || record.date || new Date().toLocaleDateString('en-CA');
    const isBill = type === 'bill';

    return (
        <Box key={record._id} className="bill-container">
            <Box className="print-header">
                <div className="header-top-line">
                    ॥ श्री गणेशाय नमः ॥
                </div>
                <div className="header-main-grid">
                    <div className="logo-section">
                        <img src={ganesh} alt="Ganpati God Logo" width="100" height="100" />
                    </div>
                    <div className="company-details-section">
                        <div className="company-name">SHRI VINAYAK ROADWAYS</div>
                        <div className="company-tagline"><h4>CARGO MOVERS & TRANSPORT CONTRACTOR & FLEET OWNER</h4></div>
                        <div className="company-address">1, Ashirwad Estate, Near Umiya Kanta, Aslali By Pass Road, Aslali, Ahmedabad-382427</div>
                        <div className="company-contact">E-mail: Svraslali@gmail.com</div>
                    </div>
                    <div className="bill-info-section">
                         <div className="info-cell static-cell">PAN NO: 24AFKPB7580D1ZN</div>
                        <div className="info-cell static-cell">GST NO: AFKPB7580D</div>
                        <div className="info-cell lr-no-cell">L.R.No. :</div>
                        <div className="info-cell data-cell">{record.lrNo || '-'}</div>
                        <div className="info-cell truck-no-cell">Truck No. :</div>
                        <div className="info-cell data-cell">{record.truckNo || '-'}</div>
                        <div className="info-cell date-cell">Date :</div>
                        <div className="info-cell data-cell">{printDate}</div>
                       
                    </div>
                </div>
            </Box>
            <div className="consignor-consignee-section-LR">
                <div className="consignor-block-LR">
                    <div className="consignor-header-LR">Consignor's Name & Address :</div>
                    <div className="consignor-details-LR">
                        <div>{record.consignorName || '-'}</div>
                        <div>{record.consignorAddress || '-'}</div>
                    </div>
                    <div className="gst-no-LR">GST No. : {record.consignorGSTIN || record.gstNo || '-'}</div>
                </div>
                <div className="mid-info-block-LR">
                    <div className="location-info-LR">
                        <div className="location-name-LR">{record.from || '-'}</div>
                        <div className="location-divider-LR"></div>
                        <div className="location-label-LR">FROM</div>
                    </div>
                    <div className="location-info-LR">
                        <div className="location-name-LR">{record.to || '-'}</div>
                        <div className="location-divider-LR"></div>
                        <div className="location-label-LR">To</div>
                    </div>
                </div>
                <div className="consignee-block-LR">
                    <div className="consignee-header-LR">Consignee's Name & Address :</div>
                    <div className="consignee-details-LR">
                        <div>{record.consigneeName || '-'}</div>
                        <div>{record.consigneeAddress || '-'}</div>
                    </div>
                    <div className="gst-no-LR">GST No. : {record.consigneeGSTIN || record.gstNo || '-'}</div>
                </div>
            </div>
            <table className="goods-table">
                <thead>
                    <tr>
                        <th className="no-articles-col">No. of Article</th>
                        <th className="description-col">Natural of Goods Said to Contain</th>
                        <th className="weight-col">WEIGHT</th>
                        <th className="rate-col">Rate</th>
                        <th className="total-freight-col">Total Freight</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="no-articles-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.partys || '-'}</div>
                        </td>
                        <td className="description-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.description || '-'}</div>
                        </td>
                        <td className="weight-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>{record.weight || '0.00'}</div>
                        </td>
                        <td className="rate-col">
                            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>0.00</div>
                        </td>
                        <td className="total-freight-col">
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', paddingBottom: '3px' }}>
                                <span>To Pay</span>
                                <span>To Paid</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="charges-footer-grid">
                <div className="left-charges-block">
                    <div className="charge-row">
                        <span className="charge-label">Bill No.:</span>
                        <span className="charge-data">{record.billNo || '-'}</span>
                    </div>
                    <div className="charge-row">
                        <span className="charge-label">Goods Value Rs.:</span>
                        <span className="charge-data">{record.valueOfGoods || '0.00'}</span>
                    </div>
                    <div className="charge-row">
                        <span className="charge-label">Delivery at:</span>
                        <span className="charge-data">{record.deliveryAt || 'DOOR DELIVERY'}</span>
                    </div>
                </div>
                <div className="mid-charges-block">
                    <div className="mid-row">
                        <span className="charge-label">GST PAID BY</span>
                        <span className="charge-data">{record.gstinNo || record.gstNo ? 'Consignor' : 'N.Wt.'}</span>
                    </div>
                    <div className="mid-row">
                        <span className="charge-label">G.Wt.</span>
                        <span className="charge-data"></span>
                    </div>
                    <div className="mid-row">
                        <span className="charge-label">T.Wt.</span>
                        <span className="charge-data"></span>
                    </div>
                    <div className="mid-row">
                        <span className="charge-label">N.Wt.</span>
                        <span className="charge-data"></span>
                    </div>
                </div>
                <div className="right-charges-block">
                    <div className="charge-row">
                        <span className="charge-label">Bilty Charge</span>
                    </div>
                    <div className="charge-row">
                        <span className="charge-label">Hamali</span>
                    </div>
                    <div className="charge-row">
                        <span className="charge-label">Less Adv.</span>
                    </div>
                    <div className="charge-row">
                        <span className="charge-label">Grand Total</span>
                    </div>
                </div>
            </div>
            <div className="final-footer">
                
                <div className="disclaimer-box">
                    Above Consignment is taken at the risk of consignor and consignee. We are only broker between truck Owner Driver and Proprietors of the consignment. Due to mistake of a driver or due to any or their truck if any accident and goods are damaged, SHRI VINAYAK ROADWAYS is not responsible, Insurance of the goods is to be taken by the consignor SHRI VINAYAK ROADWAYS is not responsible for the payment made on the receipt. Responsibility of leakage is on Consignor and Consignee Only.
                </div>
                <div className="jurisdiction-line">
                <div className="footers">
                    <div className="charge-ro">
                        <span className="charge-labe">bank Name:</span>
                        <span className="charge-data">{'ICICI' || '-'}</span>
                    </div>
                    <div className="charge-ro">
                        <span className="charge-labe">A.c. No:</span>
                        <span className="charge-data">{624405039633 || '0.00'}</span>
                    </div>
                    <div className="charge-ro">
                        <span className="charge-labe">IFSC Code:</span>
                        <span className="charge-data">{'ICICI0006244' || 0}</span>
                    </div>               
                    
                </div> 
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-30px',marginLeft: '370px' }}>
                        <img src={sign} alt="Signature" style={{ width: '120px', height: '80px', marginBottom: '10px' }} />
                        <span className="jurisdiction-text">For SHRI VINAYAK ROADWAYS</span>
                    </div>
                </div>
            </div>
        </Box>
    );
};

return (
    <>
        <style>
            {`
            /* General Styles */
            body {
                font-family: 'Roboto', sans-serif;
                background-color: #f4f6f8;
                color: #333;
            }
            .form-container {
                padding: 20px;
            }
            .MuiDialog-paper {
                border-radius: 12px !important;
            }
            .form-section-grid {
                margin-bottom: 24px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
                .contact-row {
  display: flex;
  justify-content: space-between; /* places items on same line with space between */
  align-items: center;
  margin-top: 4px;
}

/* Optional spacing between contact info */
.contact-row .company-contact {
  margin-right: 20px;
}
  .consignor-consignee-section-LR {
                display: grid;
                grid-template-columns: 2fr 1fr 2fr;
                border: 1px solid #000;
                border-bottom: none;
                font-size: 10pt;
              }
              .consignor-block-LR, .consignee-block-LR {
                border-right: 1px solid #000;
                padding: 5px;
              }
              .consignee-block-LR {
                border-right: none;
              }
              .consignor-header-LR, .consignee-header-LR, .party-header-LR {
                font-weight: bold;
                text-decoration: underline;
                margin-bottom: 5px;
              }
              .gst-no-LR {
                margin-top: 5px;
                font-style: italic;
              }
              .mid-info-block-LR {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-right: 1px solid #000;
              }
              .location-info-LR {
                text-align: center;
                margin: 5px 0;
              }
              .location-name-LR {
                font-weight: bold;
                font-size: 12pt;
              }
              .location-divider-LR {
                height: 1px;
                background-color: #000;
                margin: 2px 0;
              }
              .location-label-LR {
                font-size: 8pt;
                font-weight: bold;
              }
            .form-section-title {
                font-size: 1.25rem;
                font-weight: 500;
                color: #1a237e;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 2px solid #3f51b5;
            }
            .MuiTextField-root,
            .MuiSelect-root {
                width: 100%;
            }
            .MuiInputBase-root {
                border-radius: 8px !important;
            }
            .MuiInputLabel-root {
                color: #616161;
            }
            .Mui-focused .MuiInputLabel-root {
                color: #3f51b5;
            }
            .MuiOutlinedInput-root {
                & fieldset {
                    border-color: #bdbdbd;
                }
                &:hover fieldset {
                    border-color: #757575;
                }
                &.Mui-focused fieldset {
                    border-color: #3f51b5;
                }
            }
            .MuiDialogActions-root {
                padding: 16px 24px !important;
                background-color: #f8f9fa;
                border-top: 1px solid #e0e0e0;
            }
            @media (max-width: 600px) {
                .form-section-grid {
                    padding: 12px;
                }
            }
            .print-table { display: none; }
            @media print {
            .no-print {
    display: none !important;
  }
     @page {
    margin: 0.5cm; /* example margin */
  }
              body { margin: 0; }
              body * { visibility: hidden; }
              .print-table, .print-table * { visibility: visible; }
              .print-table {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 210mm;
                height: 297mm;
                margin: 0 auto;
                padding: 10mm;
                font-family: 'Arial', sans-serif;
                font-size: 10pt;
                color: #000;
                background: #FFF;
                box-sizing: border-box;
              }
              .bill-container {
                page-break-after: always;
                width: 100%;
                border: 1px solid #000;
                padding: 5px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
              }
              .print-header {
                width: 100%;
                font-family: 'Times New Roman', serif;
              }
              .header-top-line {
                text-align: center;
                border: 1px solid #000;
                padding: 2px 0;
                font-size: 12pt;
                margin-bottom: 5px;
              }
              .header-main-grid {
                display: grid;
                grid-template-columns: 1.2fr 2.5fr 1.3fr;
                border: 1px solid #000;
                margin-bottom: 5px;
              }
              .logo-section {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 5px;
                border-right: 1px solid #000;
              }
              .logo-section img {
                width: 100px;
                height: 100px;
                margin-right: 5px;
                display: block;
                visibility: visible;
                object-fit: contain;
              }
              .logo-text-block {
                display: flex;
                flex-direction: column;
                align-items: center;
                font-weight: bold;
                white-space: nowrap;
              }
              .logo-main-text {
                font-size: 10pt;
              }
              .logo-sub-text {
                font-size: 8pt;
              }
              .company-details-section {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border-right: 1px solid #000;
                text-align: center;
                padding: 5px;
              }
              .company-name {
                font-size: 16pt;
                font-weight: bold;
                text-decoration: underline;
              }
              .company-tagline, .company-address {
                font-size: 8pt;
              }
              .company-contact {
                font-size: 9pt;
              }
              .bill-info-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 5px;
              }
              .info-cell {
                font-weight: bold;
                padding: 2px 5px;
                border-bottom: 1px solid #000;
                font-size: 9pt;
              }
              .data-cell {
                border-bottom: 1px solid #000;
                font-weight: normal;
                font-size: 9pt;
                padding: 2px 5px;
              }
              .gstin-cell {
                grid-column: 1 / span 2;
                text-align: center;
                font-size: 10pt;
                border-bottom: 1px solid #000;
                margin-bottom: 5px;
              }
              .static-cell {
                grid-column: 1 / span 2;
                text-align: center;
                font-weight: bold;
                font-size: 9pt;
                padding: 2px 5px;
                border-bottom: 1px solid #000;                  
              }
              .consignor-consignee-section {
                display: grid;
                
                grid-template-columns: 2fr 1fr 2fr;
                border: 1px solid #000;
                border-bottom: none;
                font-size: 10pt;
              }
              .consignor-block, .consignee-block {
                border-right: 1px solid #000;
                width: 500px;
                padding: 5px;
              }
              .consignee-block {
                border-right: none;
              }
              .consignor-header, .consignee-header, .party-header {
                font-weight: bold;
                text-decoration: underline;
                margin-bottom: 5px;
              }
              .gst-no {
                margin-top: 5px;
                font-style: italic;
                margin-top: 20px;
              }
              .mid-info-block {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 200px;
                justify-content: center;
                border-right: 1px solid #000;
              }
              .location-info {
                text-align: center;
                margin: 5px 0;
              }
              .location-name {
                font-weight: bold;
                font-size: 12pt;
              }
              .location-divider {
                height: 1px;
                background-color: #000;
                margin: 2px 0;
              }
              .location-label {
                font-size: 8pt;
                margin-top: 20px;
                margin-bottom: 20px;
                font-weight: bold;
              }
              .goods-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 5px;
                font-size: 9pt;
                border: 1px solid #000;
              }
              .goods-table th, .goods-table td {
                border: 1px solid #000;
                padding: 3px;
                text-align: center;
              }
              .no-articles-col { width: 15%; }
              .description-col { width: 40%; }
              .weight-col { width: 15%; }
              .rate-col, .total-freight-col { width: 15%; }
              .charges-footer-grid {
                display: grid;
                grid-template-columns: 1.5fr 1fr 1fr;
                border: 1px solid #000;
                padding: 5px;
                margin-bottom: 5px;
              }
                .footer{
                width:300px;
                color: black;
                font-weight: 500;
                font-size:15px;
                margin-left:-60px;
                margin-top:-20px;
                }
                 .footers{
                width:300px;
                color: black;
                font-weight: 500;
                font-size:15px;
                
                }
              .left-charges-block, .mid-charges-block, .right-charges-block {
                display: flex;
                flex-direction: column;
              }
              .charge-row {
                display: flex;
                
                padding: 2px;
              }
              .charge-label { font-weight: bold; }
              .final-footer {
                border: 1px solid #000;
                padding: 5px;
                font-size: 8pt;
              }
              .disclaimer-box {
                border: 1px solid #000;
                padding: 3px;
                margin-bottom: 5px;
              }
              .jurisdiction-line {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                text-align: center;
                margin-top:40px;
              }
              .party-details-section {
                border: 1px solid #000;
                padding: 10px;
                margin-bottom: 10px;
              }
              .party-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 10pt;
              }
            }
            `}
        </style>
            <Box>
                <Header />
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <ToggleButtonGroup
  value={view}
  exclusive
  onChange={handleViewChange}
  aria-label="view toggle"
  style={{
    backgroundColor: '#e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
    padding: '4px',
    display: 'flex',
    justifyContent: 'center',
  }}
>
  <ToggleButton
    value="bill"
    aria-label="bill view"
    style={{
      textTransform: 'none',
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: window.innerWidth <= 600 ? '0.8125rem' : '0.875rem',
      color: '#1f2937',
      backgroundColor: 'transparent',
      padding: window.innerWidth <= 600 ? '6px 12px' : '8px 16px',
      border: 'none',
      transition: 'all 0.2s ease-in-out',
    }}
    sx={{
      '&:hover': {
        backgroundColor: '#cbd5e1',
        color: '#1f2937',
      },
      '&.Mui-selected': {
        backgroundColor: '#2d9fd4',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      '&.Mui-selected:hover': {
        backgroundColor: '#2d9fd4',
      },
      '&:focus': {
        outline: '2px solid #2d9fd4',
        outlineOffset: '2px',
      },
    }}
  >
    Bill
  </ToggleButton>
  <ToggleButton
    value="lr"
    aria-label="lr view"
    style={{
      textTransform: 'none',
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: window.innerWidth <= 600 ? '0.8125rem' : '0.875rem',
      color: '#1f2937',
      backgroundColor: 'transparent',
      padding: window.innerWidth <= 600 ? '6px 12px' : '8px 16px',
      border: 'none',
      transition: 'all 0.2s ease-in-out',
    }}
    sx={{
      '&:hover': {
        backgroundColor: '#cbd5e1',
        color: '#1f2937',
      },
      '&.Mui-selected': {
        backgroundColor: '#2d9fd4',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      '&.Mui-selected:hover': {
        backgroundColor: '#2d9fd4',
      },
      '&:focus': {
        outline: '2px solid #2d9fd4',
        outlineOffset: '2px',
      },
    }}
  >
    LR
  </ToggleButton>
  <ToggleButton
    value="party"
    aria-label="party view"
    style={{
      textTransform: 'none',
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: window.innerWidth <= 600 ? '0.8125rem' : '0.875rem',
      color: '#1f2937',
      backgroundColor: 'transparent',
      padding: window.innerWidth <= 600 ? '6px 12px' : '8px 16px',
      border: 'none',
      transition: 'all 0.2s ease-in-out',
    }}
    sx={{
      '&:hover': {
        backgroundColor: '#cbd5e1',
        color: '#1f2937',
      },
      '&.Mui-selected': {
        backgroundColor: '#2d9fd4',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      '&.Mui-selected:hover': {
        backgroundColor: '#2d9fd4',
      },
      '&:focus': {
        outline: '2px solid #2d9fd4',
        outlineOffset: '2px',
      },
    }}
  >
    Party
  </ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                            {(view === 'bill' ? selectedBillRows.length : view === 'lr' ? selectedLrRows.length : selectedpartyRows.length) > 0 && (
                                <Button
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteSelected}
                                    disabled={isSubmitting}
                                    sx={{
                                        textTransform: 'none',
                                        fontFamily: '"Roboto", sans-serif',
                                        fontWeight: 500,
                                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                        padding: { xs: '6px 12px', sm: '8px 16px' },
                                        backgroundColor: isSubmitting ? '#d1d5db' : '#dc2626',
                                        color: '#ffffff',
                                        borderRadius: '8px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: isSubmitting ? '#d1d5db' : '#b91c1c',
                                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                                        },
                                        '&:focus': {
                                            outline: '2px solid #dc2626',
                                            outlineOffset: '2px',
                                        },
                                        '& .MuiButton-startIcon': {
                                            marginRight
                                            : '6px',
                                        },
                                    }}
                                >
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Remove Selected'}
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpen}
                                sx={{
                                    textTransform: 'none',
                                    fontFamily: '"Roboto", sans-serif',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    padding: { xs: '6px 12px', sm: '8px 16px' },
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.2s ease-in-out',
                                    mr: 1,
                                    '&:hover': {
                                        backgroundColor: '#059669',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                                    },
                                    '&:focus': {
                                        outline: '2px solid #10b981',
                                        outlineOffset: '2px',
                                    },
                                    '& .MuiButton-startIcon': {
                                        marginRight: '6px',
                                    },
                                }}
                            >
                                Add New
                            </Button>
                           {view != 'party'? <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                onClick={handlePrintDialogOpen}
                                sx={{
                                    textTransform: 'none',
                                    fontFamily: '"Roboto", sans-serif',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    padding: { xs: '6px 12px', sm: '8px 16px' },
                                    backgroundColor: '#1e40af',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: '#3b82f6',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                                    },
                                    '&:focus': {
                                        outline: '2px solid #1e40af',
                                        outlineOffset: '2px',
                                    },
                                    '& .MuiButton-startIcon': {
                                        marginRight: '6px',
                                    },
                                }}
                            >
                                Print
                            </Button>:""}
                        </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {view === 'bill' && renderTable(billRows, selectedBillRows, 'bill')}
                {view === 'lr' && renderTable(lrRows, selectedLrRows, 'lr')}
                {view === 'party' && renderTable(partyRows, selectedpartyRows, 'party')}

                </Box>
                </Box>

                <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                sx={{
                    '& .MuiDialog-paper': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    maxWidth: '900px',
                    },
                }}
                >
                <DialogTitle
                    sx={{
                    fontFamily: '"Roboto", sans-serif',
                    fontWeight: 600,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #d1d5db',
                    padding: { xs: '12px 16px', sm: '16px 24px' },
                    }}
                >
                    {editingId ? `Edit ${view === 'bill' ? 'Bill' : view === 'lr' ? 'LR' : 'Party'}` : `Add New ${view === 'bill' ? 'Bill' : view === 'lr' ? 'LR' : 'Party'}`}
                </DialogTitle>
               <DialogContent
    sx={{
        padding: { xs: '16px', sm: '24px' },
        backgroundColor: '#f8fafc',
    }}
>
    <Box
        component="form"
        sx={{
            mt: 2,
        }}
        className="form-container"
    >
        <Grid container spacing={2}>
            {(view === 'bill' ? billFormFields : view === 'lr' ? lrFormFields : partyFormFields).map(section => (
                <Grid item xs={12} key={section.section}>
                    <Box
                        className="form-section-grid"
                        sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            padding: { xs: '12px', sm: '16px' },
                        }}
                    >
                        <Typography
                            className="form-section-title"
                            sx={{
                                fontFamily: '"Roboto", sans-serif',
                                fontWeight: 500,
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                color: '#1a237e',
                                mb: 1.5,
                            }}
                        >
                            {section.section}
                        </Typography>
                        <Grid container spacing={2}>
                            {section.fields.map(field => (
                                <Grid item xs={12} sm={6} md={4} key={field.name}>
                                    {field.type === 'select' ? (
                                        <Select
                                            name={field.name}
                                            value={form[field.name] || ''}
                                            onChange={handleChange}
                                            displayEmpty
                                            fullWidth
                                            required={field.required}
                                            error={!!errors[field.name]}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    backgroundColor: '#ffffff',
                                                },
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                {field.label}
                                            </MenuItem>
                                            {field.name === 'selectedPartyId' ? (
                                                partyRows.map(party => (
                                                    <MenuItem key={party._id} value={party._id}>
                                                        {party.partyName}
                                                    </MenuItem>
                                                ))
                                            ) : field.name === 'selectedLrId' ? (
                                                lrRows.map(lr => (
                                                    <MenuItem key={lr._id} value={lr._id}>
                                                        {lr.lrNo || 'No LR Number'}
                                                    </MenuItem>
                                                ))
                                            ) : null}
                                        </Select>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            name={field.name}
                                            value={form[field.name] || ''}
                                            onChange={handleChange}
                                            required={field.required}
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name]}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    backgroundColor: '#ffffff',
                                                },
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
</DialogContent>
                <DialogActions
                    sx={{
                    padding: { xs: '12px 16px', sm: '16px 24px' },
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #d1d5db',
                    justifyContent: 'flex-end',
                    gap: 1,
                    }}
                >
                    <Button
                    onClick={handleClose}
                    sx={{
                        textTransform: 'none',
                        fontFamily: '"Roboto", sans-serif',
                        fontWeight: 500,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        padding: { xs: '6px 12px', sm: '8px 16px' },
                        backgroundColor: '#1e40af',
                        color: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                        backgroundColor: '#3b82f6',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                        },
                        '&:focus': {
                        outline: '2px solid #1e40af',
                        outlineOffset: '2px',
                        },
                    }}
                    >
                    Cancel
                    </Button>
                    <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                        textTransform: 'none',
                        fontFamily: '"Roboto", sans-serif',
                        fontWeight: 500,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        padding: { xs: '6px 12px', sm: '8px 16px' },
                        backgroundColor: isSubmitting ? '#d1d5db' : '#10b981',
                        color: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                        backgroundColor: isSubmitting ? '#d1d5db' : '#059669',
                        boxShadow: isSubmitting ? '0 1px 3px rgba(0, 0, 0, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.12)',
                        },
                        '&:focus': {
                        outline: '2px solid #10b981',
                        outlineOffset: '2px',
                        },
                        '& .MuiButton-startIcon': {
                        marginRight: '6px',
                        },
                    }}
                    >
                    {isSubmitting ? <CircularProgress size={24} /> : (editingId ? 'Update' : 'Save')}
                    </Button>
                </DialogActions>
                </Dialog>

                    <Dialog
            open={printDialogOpen}
            onClose={handlePrintDialogClose}
            fullWidth
            maxWidth="sm"
            sx={{
                '& .MuiDialog-paper': {
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                maxWidth: '600px',
                width: '100%',
                minHeight: '150px',
                maxHeight: '250px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                },
            }}
            >
            <DialogTitle
                sx={{
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 600,
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                color: '#1f2937',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #d1d5db',
                padding: { xs: '8px 12px', sm: '12px 16px' },
                width: '100%',
                boxSizing: 'border-box',
                }}
            >
                Print Options
            </DialogTitle>
            <DialogContent
                sx={{
                padding: { xs: '12px', sm: '16px' },
                backgroundColor: '#ffffff',
                color: '#1f2937',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                }}
            >
                <Typography
                sx={{
                    fontFamily: '"Roboto", sans-serif',
                    fontWeight: 400,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    color: '#1f2937',
                }}
                >
                Choose what you want to print.
                </Typography>
            </DialogContent>
            <DialogActions
                sx={{
                padding: { xs: '8px 12px', sm: '12px 16px' },
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #d1d5db',
                justifyContent: 'flex-end',
                gap: 1,
                width: '100%',
                boxSizing: 'border-box',
                }}
            >
                <Button
                onClick={handlePrintDialogClose}
                sx={{
                    textTransform: 'none',
                    fontFamily: '"Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    padding: { xs: '4px 8px', sm: '6px 12px' },
                    backgroundColor: '#1e40af',
                    color: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease-in-out',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '100px' },
                    '&:hover': {
                    backgroundColor: '#3b82f6',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    },
                    '&:focus': {
                    outline: '2px solid #1e40af',
                    outlineOffset: '2px',
                    },
                }}
                >
                Cancel
                </Button>
                <Button
                onClick={handlePrintSelected}
                variant="contained"
                sx={{
                    textTransform: 'none',
                    fontFamily: '"Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    padding: { xs: '4px 8px', sm: '6px 12px' },
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease-in-out',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '100px' },
                    '&:hover': {
                    backgroundColor: '#059669',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    },
                    '&:focus': {
                    outline: '2px solid #10b981',
                    outlineOffset: '2px',
                    },
                }}
                >
                Print Selected
                </Button>
                <Button
                onClick={handlePrint}
                variant="contained"
                sx={{
                    textTransform: 'none',
                    fontFamily: '"Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    padding: { xs: '4px 8px', sm: '6px 12px' },
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease-in-out',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '100px' },
                    '&:hover': {
                    backgroundColor: '#059669',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    },
                    '&:focus': {
                    outline: '2px solid #10b981',
                    outlineOffset: '2px',
                    },
                }}
                >
                Print All
                </Button>
            </DialogActions>
                    </Dialog>

          <Box className="print-table" sx={{ position: 'absolute', top: '-9999px' }}>
  {printMode === 'all' && (
    view === 'bill'
      ? billRows.map(record => renderPrintRecord(record, view))
      : view === 'lr'
        ? lrRows.map(record => renderPrintRecordofLR(record, view))
        : partyRows.map(record => renderPrintRecord(record, view))
  )}

  {printMode === 'selected' && (
    view === 'bill'
      ? billRows
          .filter(row => selectedBillRows.includes(String(row._id)))
          .map(record => renderPrintRecord(record, view))
      : view === 'lr'
        ? lrRows
            .filter(row => selectedLrRows.includes(String(row._id)))
            .map(record => renderPrintRecordofLR(record, view))
        : partyRows
            .filter(row => selectedpartyRows.includes(String(row._id)))
            .map(record => renderPrintRecord(record, view))
  )}
</Box>

        </>
    );
};

export default Home;