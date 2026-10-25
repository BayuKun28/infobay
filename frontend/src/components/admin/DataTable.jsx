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
} from '@mui/material';
import { Search, X } from 'lucide-react';

export default function DataTable({
  columns = [],
  rows = [],
  searchPlaceholder = 'Cari data...',
  searchField = 'title',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  emptyMessage = 'Tidak ada data ditemukan.',
  renderRow,
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
      sx={{
        border: '3px solid black',
        boxShadow: '4px 4px 0px 0px #000000',
        borderRadius: 0,
        overflow: 'hidden',
      }}
    >
      {/* Table Toolbar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          borderBottom: '2px solid black',
          bgcolor: 'background.paper',
        }}
      >
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
                <Search size={18} strokeWidth={2.5} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <Box
                  component="button"
                  onClick={() => setSearch('')}
                  sx={{
                    border: 'none',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    p: 0.5,
                  }}
                >
                  <X size={16} strokeWidth={2.5} />
                </Box>
              </InputAdornment>
            ) : null,
            sx: {
              borderRadius: 0,
              fontWeight: 700,
              fontSize: '0.85rem',
            },
          }}
          sx={{ maxWidth: { xs: '100%', sm: 320 } }}
        />

        {actionSlot && <Box sx={{ display: 'flex', gap: 1 }}>{actionSlot}</Box>}
      </Box>

      {/* Table Content */}
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#FFDE59', borderBottom: '2px solid black' }}>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: '#000000',
                    borderBottom: '2px solid black',
                    py: 1.5,
                    width: col.width,
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
                  sx={{ py: 6, fontWeight: 700, color: 'text.secondary' }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : renderRow ? (
              paginatedRows.map((row, idx) => renderRow(row, idx, page * rowsPerPage + idx))
            ) : (
              paginatedRows.map((row, idx) => (
                <TableRow key={idx} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align || 'left'} sx={{ fontWeight: 600 }}>
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
        sx={{
          borderTop: '2px solid black',
          fontWeight: 700,
        }}
      />
    </Paper>
  );
}
