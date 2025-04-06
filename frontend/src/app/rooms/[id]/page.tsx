import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import RoomDetails from './RoomDetails';

interface RoomPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  // We'd normally fetch room data here to generate dynamic metadata
  // but we'll create a simple version for this example
  return {
    title: `Room Details - Hotel Booking`,
    description: 'View details and book this room',
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  // Validate the ID parameter
  const id = parseInt(params.id);
  if (isNaN(id)) {
    notFound();
  }

  return (
    <MainLayout>
      <RoomDetails roomId={id} />
    </MainLayout>
  );
} 