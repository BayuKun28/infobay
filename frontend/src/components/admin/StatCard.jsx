import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary.main',
  onClick,
}) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 2.5,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: (th) =>
                th.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.06)',
              borderColor: 'primary.main',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
              fontSize: '0.72rem',
            }}
          >
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: (th) =>
                  th.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.08)',
                color: color || 'primary.main',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} />
            </Box>
          )}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.8rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
