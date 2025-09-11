import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBookingByIdQuery } from '../services/api';
import io from 'socket.io-client';

export default function BookingDetailScreen({ route }: any) {
  const { id } = route.params as { id: string };
  const { data, refetch } = useBookingByIdQuery(id);
  const [status, setStatus] = useState<string | undefined>(data?.status);

  useEffect(() => { setStatus(data?.status); }, [data?.status]);
  useEffect(() => {
    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2025';
    const socket = io(socketUrl, { autoConnect: true });
    socket.on('bookingStatusUpdated', (payload: any) => {
      if (payload?.id === id) { setStatus(payload.status); refetch(); }
    });
    return () => socket.disconnect();
  }, [id, refetch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Detail</Text>
      <Text>Status: {status}</Text>
      <View style={styles.timeline}>
        {['accepted','on_the_way','washing','complete','cancel'].map((s) => (
          <Text key={s} style={{ color: status === s ? '#0a84ff' : '#999' }}>{s}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  timeline: { marginTop: 12, gap: 6 },
});


