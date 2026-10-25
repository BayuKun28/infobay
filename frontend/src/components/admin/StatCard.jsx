import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#FFDE59',
  border = '2px solid black',
  onClick,
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        border,
        boxShadow: '4px 4px 0px 0px #000000',
        borderRadius: 0,
        bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '6px 6px 0px 0px #000000',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                bgcolor: color,
                border: '2px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0px #000',
              }}
            >
              <Icon size={20} color="#000000" strokeWidth={2.5} />
            </Box>
          )}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
