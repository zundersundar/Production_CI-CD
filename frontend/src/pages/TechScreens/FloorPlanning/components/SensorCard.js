/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React from 'react';
import { Box, Typography } from '@mui/material';

const cardSectionStyle = (showCards) => css`
  display: ${showCards ? 'flex' : 'none'};
  flex-wrap: wrap;
  gap: 8px;
  justify-content: start;
  transition: all 0.5s ease;
  height: ${showCards ? 'auto' : 0};
  overflow: hidden;
`;

const SensorCards = ({ showCards, cards, selectedIndex, setSelectedIndex }) => {

  const handleCardClick = (index) => {
    setSelectedIndex(index);
  };

  return (
    <Box sx={{ padding: '12px' }}>
      <Box css={cardSectionStyle(showCards)}>
        {cards.map((card, index) => (
          <Box
            key={index}
            onClick={() => handleCardClick(index)} // Handle card click
            sx={{
              height: 35, // Adjusted size to accommodate image and text
              width: '83px', // Adjusted width
              justifyContent: 'flex-start',
              padding: '12px',
              background: index === selectedIndex ? '#008080' : card.bgColor, // Highlight selected card
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px', // Space between image and text
              boxShadow: 'none',
              cursor: 'pointer', // Show pointer cursor on hover
              transition: 'background-color 0.3s ease',
            }}
          >
            <Box
              sx={{
                width: '24px', // Adjust as needed
                height: '24px', // Adjust as needed
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={card.Icon}
                alt={card.label}
                style={{ width: '90px', height: '100%', objectFit: 'contain' }} // Adjust image fit
              />
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
