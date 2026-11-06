import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export default function DataTable({
  columns = [],
  rows = [],
  searchPlaceholder = 'Cari data...',
  searchField = 'title',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  emptyMessage = 'Tidak ada data ditemukan.',
  renderRow,
  filterSlot,
  actionSlot,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const query = search.toLowerCase();
    return rows.filter((row) => {
      if (typeof searchField === 'function') {
        return searchField(row, query);
      }
      const val = row[searchField];
      return val ? String(val).toLowerCase().includes(query) : false;
    });
  }, [rows, search, searchField]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Table Toolbar: Filter Combobox Left, Search & Actions Right */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)',
        }}
      >
        {/* LEFT: Filter ComboBox Slot */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {filterSlot}
        </Box>

        {/* RIGHT: Search Input & Action Slot */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'stretch', sm: 'flex-end' }, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearch('');
                      setPage(0);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                borderRadius: 2,
                fontSize: '0.84rem',
              },
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />

          {actionSlot && <Box sx={{ display: 'flex', gap: 1 }}>{actionSlot}</Box>}
        </Box>
      </Box>

      {/* Table Content */}
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.74rem',
                    letterSpacing: '0.04em',
                    color: 'text.secondary',
                    py: 1.5,
                    width: col.width,
                    borderColor: 'divider',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, color: 'text.secondary', borderColor: 'divider' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : renderRow ? (
              paginatedRows.map((row, idx) => renderRow(row, idx, page * rowsPerPage + idx))
            ) : (
              paginatedRows.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '& td': { borderColor: 'divider' },
                  }}
                >
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align || 'left'} sx={{ fontWeight: 500, fontSize: '0.84rem' }}>
                      {col.render ? col.render(row) : row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'text.secondary',
          },
        }}
      />
    </Paper>
  );
}
