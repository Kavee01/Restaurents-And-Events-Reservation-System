import { Paper, Text, Group, Avatar, Stack, Divider, Rating, Title, Badge, Alert } from '@mantine/core';
import { IconAlertCircle, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { colors } from '../../theme/colors';

function ReviewsDisplay({ reviews = [], averageRating = 0 }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="No Reviews Yet"
        color="blue"
        radius="md"
        variant="light"
        style={{
          backgroundColor: 'rgba(22, 46, 80, 0.6)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        This item hasn't received any reviews yet. Be the first to share your experience!
      </Alert>
    );
  }

  // Format the average rating to one decimal place
  const formattedRating = parseFloat(averageRating).toFixed(1);
  
  return (
    <Stack spacing="md">
      <Group position="apart" align="center">
        <Title order={3} style={{ color: '#d1ae36' }}>Customer Reviews</Title>
        <Group spacing="xs">
          <Rating value={averageRating} readOnly fractions={2} color="#d1ae36" />
          <Badge size="lg" color={getRatingColor(averageRating)}>
            {formattedRating}
          </Badge>
          <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </Text>
        </Group>
      </Group>
      
      <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <Stack spacing="lg">
        {reviews.map((review, index) => {
          // Extract user name with fallbacks
          let userName = 'Anonymous';
          if (review.user) {
            if (typeof review.user === 'object') {
              userName = review.user.name || review.user.email || 'Anonymous';
            } else if (typeof review.user === 'string') {
              userName = 'User';
            }
          }
          
          // Format date with fallback
          const formattedDate = review.createdAt 
            ? dayjs(review.createdAt).format('MMM D, YYYY') 
            : '';
            
          return (
            <Paper 
              key={review._id || index} 
              p="md" 
              withBorder
              style={{
                backgroundColor: 'rgba(25, 40, 65, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <Group position="apart" mb="xs">
                <Group>
                  <Avatar color="#d1ae36" radius="xl">
                    <IconUser size={24} />
                  </Avatar>
                  <div>
                    <Text weight={500} style={{ color: 'white' }}>{userName}</Text>
                    {formattedDate && (
                      <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {formattedDate}
                      </Text>
                    )}
                  </div>
                </Group>
                <Rating value={review.rating} readOnly size="sm" color="#d1ae36" />
              </Group>
              
              {review.review && (
                <Text size="sm" mt="xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {review.review}
                </Text>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}

// Helper function to determine the color based on rating
function getRatingColor(rating) {
  if (rating >= 4.5) return 'green';
  if (rating >= 3.5) return 'teal';
  if (rating >= 2.5) return 'yellow';
  if (rating >= 1.5) return 'orange';
  return 'red';
}

export default ReviewsDisplay; 