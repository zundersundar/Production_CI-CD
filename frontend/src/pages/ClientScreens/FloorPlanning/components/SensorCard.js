/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';


const cardSectionStyle = (showCards) => css`
  display: ${showCards ? 'flex' : 'none'};
  flex-wrap: wrap;
  gap: 8px;
  justify-content: start;
  transition: all 0.5s ease;
  height: ${showCards ? 'auto' : 0};
  overflow: hidden;
`;

const SensorCards = (props) => {

  const {showCards,cards} = props;  
 



  return (
    <Box sx={{ padding: '12px' }}>
      <Box css={cardSectionStyle(showCards)}>
        {cards.map((card, index) => (
          <Box
            key={index}
            sx={{
              height: 25,
              width: '83px',
              justifyContent:'center',
              padding: '12px 12px',
              background: card.bgColor,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: 32,
              }}
            >
              <card.Icon sx={{ fontSize: 24}} />
            </Box>
            <Typography
              sx={{
                color: 'white',
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '400',
                wordWrap: 'break-word',
              }}
            >
              {card.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SensorCards;
