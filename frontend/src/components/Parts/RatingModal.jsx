import { useState } from 'react';
import { Modal, Button, Textarea, Group, Text, Rating, Stack, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';

function RatingModal({ opened, onClose, booking, bookingType, onRatingSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { sendRequest } = useFetch();
  const { successToast, errorToast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      errorToast({
        title: 'Rating Required',
        message: 'Please select a rating before submitting your review.'
      });
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      let endpoint = '';
      const reviewData = {
        rating,
        review: review.trim(),
        bookingId: booking._id
      };
      
      // Add ID field based on booking type
      switch (bookingType) {
        case 'restaurant':
          endpoint = `restaurant/${booking.restaurant?._id}/reviews`;
          reviewData.restaurantId = booking.restaurant?._id;
          break;
        case 'activity':
          endpoint = `activities/${booking.activity?._id}/reviews`;
          reviewData.activityId = booking.activity?._id;
          break;
        case 'service':
          endpoint = `services/${booking.service?._id}/reviews`;
          reviewData.serviceId = booking.service?._id;
          break;
        case 'event':
          endpoint = `events/${booking.event?._id}/reviews`;
          reviewData.eventId = booking.event?._id;
          break;
        default:
          throw new Error('Invalid booking type');
      }

      console.log('Submitting review to endpoint:', endpoint);
      console.log('Review data:', reviewData);

      const response = await sendRequest(endpoint, 'POST', reviewData);
      console.log('Review submission response:', response);
      
      successToast({
        title: 'Review Submitted',
        message: 'Thank you for sharing your experience!'
      });
      
      // Reset form and close modal
      setRating(0);
      setReview('');
      
      // Call the success callback to update the parent component
      if (onRatingSuccess) {
        onRatingSuccess(response);
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit your review. Please try again.');
      errorToast({
        title: 'Error',
        message: 'Failed to submit your review. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setError('');
    onClose();
  };

  const getTitle = () => {
    switch (bookingType) {
      case 'restaurant':
        return `Rate your visit to ${booking.restaurant?.name || 'the restaurant'}`;
      case 'activity':
        return `Rate your experience at ${booking.activity?.title || 'the activity'}`;
      case 'service':
        return `Rate your experience with ${booking.service?.title || 'the service'}`;
      case 'event':
        return `Rate your experience at ${booking.event?.title || 'the event'}`;
      default:
        return 'Rate your experience';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={getTitle()}
      centered
      size="md"
    >
      <Stack spacing="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="filled">
            {error}
          </Alert>
        )}
        
        <Text size="sm">How would you rate your overall experience?</Text>
        
        <Group position="center">
          <Rating
            value={rating}
            onChange={setRating}
            size="xl"
            color="yellow"
          />
        </Group>
        
        <Textarea
          placeholder="Share your experience with others (optional)"
          value={review}
          onChange={(e) => setReview(e.currentTarget.value)}
          minRows={4}
          maxLength={500}
        />
        
        <Text size="xs" color="dimmed" align="right">
          {review.length}/500 characters
        </Text>
        
        <Group position="right" mt="md">
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            loading={isSubmitting}
            disabled={rating === 0}
          >
            Submit Review
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default RatingModal; 