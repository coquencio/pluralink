import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { reviewService } from '../../services/review.service';
import { CreateReviewRequest } from '../../types/review.types';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../context/AuthContext';

type ReviewScreenRouteProp = {
  params: {
    bookingId: number;
  };
};

type ReviewScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Review'>;

const ReviewScreen: React.FC = () => {
  const route = useRoute<ReviewScreenRouteProp>();
  const navigation = useNavigation<ReviewScreenNavigationProp>();
  const { user } = useAuth();
  const { bookingId } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    // In a real app, you would fetch the booking to get reviewee_id
    // For now, this is a placeholder
    const revieweeId = user.role === 'client' ? 1 : 1; // Should be fetched from booking
    const revieweeType = user.role === 'client' ? 'provider' : 'client';

    setLoading(true);
    try {
      const reviewData: CreateReviewRequest = {
        booking_id: bookingId,
        reviewee_id: revieweeId,
        reviewee_type: revieweeType,
        rating,
        comment,
      };
      await reviewService.createReview(reviewData);
      Alert.alert('Success', 'Review submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leave a Review</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Rating</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Comment</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={6}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  starButton: {
    marginRight: 10,
  },
  star: {
    fontSize: 40,
    color: '#FFD700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewScreen;

