import { useState, useEffect } from 'react';
import { Button, Group, Stack, Textarea, Rating, Text, Paper, Title, Alert } from '@mantine/core';
import useToast from '../../hooks/useToast';
import { getUser } from '../../service/users';
import axios from 'axios';
import { IconAlertCircle } from '@tabler/icons-react';

function AddReviewForm({ itemId, itemType, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const { successToast, errorToast } = useToast();

  // Verify authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Get current user from local storage
        const currentUser = getUser();
        if (currentUser) {
          setUser(currentUser);
          console.log("Current user from storage:", currentUser);
        } else {
          console.log("No authenticated user found");
          setAuthError("Please log in to submit reviews.");
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        setAuthError("There was a problem verifying your authentication. Please try logging in again.");
      }
    };
    
    verifyAuth();
  }, [itemId, itemType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      errorToast({
        title: "Rating Required",
        message: "Please provide a rating before submitting your review.",
      });
      return;
    }
    
    if (!user) {
      errorToast({
        title: "Authentication Required",
        message: "You must be logged in to submit a review.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      // Simplify data structure to bare minimum
      const reviewData = {
        rating: rating,
        review: review.trim() || '',
        entityType: itemType,
        entityId: itemId
      };
      
      console.log("Submitting review with data:", reviewData);
      
      const response = await axios.post(
        `${apiUrl}/api/proxy/review`, 
        reviewData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Review submission successful:", response.data);
      
      successToast({
        title: "Review Submitted",
        message: "Thank you for sharing your feedback!",
      });
      
      // Reset form
      setRating(0);
      setReview('');
      
      if (onReviewAdded && response.data) {
        onReviewAdded(response.data);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      
      // Extract the most useful error message
      let errorMessage = "We couldn't submit your review. Please try again later.";
      
      if (err.response) {
        console.error('Server responded with error:', {
          status: err.response.status,
          data: err.response.data
        });
        
        if (err.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
          localStorage.removeItem("token");
          setAuthError("Your session has expired. Please log in again.");
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      errorToast({
        title: "Submission Failed",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper 
      p="xl" 
      style={{
        backgroundImage: 'url("/back1.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 25, 40, 0.8)',
        backdropFilter: 'blur(2px)',
        zIndex: 1
      }} />
      
      <Stack spacing="lg" style={{ position: 'relative', zIndex: 2 }}>
        <Title order={3} style={{ color: '#d1ae36', borderBottom: '1px solid rgba(209, 174, 54, 0.3)', paddingBottom: '0.5rem' }}>
          Write a Review
        </Title>
        
        {authError ? (
          <Alert 
            icon={<IconAlertCircle size={16} />}
            title="Authentication Error"
            color="red"
            variant="filled"
          >
            {authError}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <div>
                <Text mb="xs" style={{ color: 'white' }}>Your Rating</Text>
                <Group position="left">
                  <Rating 
                    value={rating} 
                    onChange={setRating} 
                    size="lg"
                    color="#d1ae36"
                  />
                  {rating > 0 && (
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {rating === 5 ? 'Excellent' : 
                        rating === 4 ? 'Very Good' : 
                        rating === 3 ? 'Good' : 
                        rating === 2 ? 'Fair' : 
                        rating === 1 ? 'Poor' : ''}
                    </Text>
                  )}
                </Group>
              </div>
              
              <div>
                <Text mb="xs" style={{ color: 'white' }}>Your Review (optional)</Text>
                <Textarea
                  placeholder="Share your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  minRows={3}
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      '&:focus': {
                        borderColor: '#d1ae36'
                      }
                    }
                  }}
                />
              </div>
              
              <Group position="right">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={rating === 0}
                  style={{
                    backgroundColor: '#d1ae36',
                    color: '#1a2a41',
                    fontWeight: 600,
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'rgba(209, 174, 54, 0.9)',
                      }
                    }
                  }}
                >
                  Submit Review
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Stack>
    </Paper>
  );
}

export default AddReviewForm; 