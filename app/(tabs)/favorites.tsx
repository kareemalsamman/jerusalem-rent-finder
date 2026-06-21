import React, { useState, useEffect } from 'react';
import { RefreshControl, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { 
  YStack, 
  XStack, 
  H1, 
  H3,
  Button, 
  Card, 
  Image, 
  Theme,
  SizableText,
  View,
  MapPin,
  Heart,
  Paragraph
} from '@blinkdotnew/mobile-ui';
import { blink } from '@/lib/blink';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (!state.isLoading) setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const { data: favoriteListings, isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: favorites } = await blink.db.favorites.list({
        where: { user_id: user.id }
      });
      
      if (!favorites || favorites.length === 0) return [];
      
      const listingIds = favorites.map((f: any) => f.listing_id);
      const { data: listings } = await blink.db.listings.list({
        where: { id: { IN: listingIds } }
      });
      
      return listings;
    },
  });

  const renderItem = ({ item }: { item: any }) => (
    <Card 
      onPress={() => router.push(`/listing/${item.id}`)}
      backgroundColor="white"
      borderRadius="$4"
      overflow="hidden"
      elevation={4}
      marginBottom="$4"
      marginHorizontal="$4"
    >
      <Card.Header padding={0}>
        <Image 
          source={{ uri: JSON.parse(item.photos || '[]')[0] }} 
          width="100%" 
          height={200} 
        />
        <YStack 
          position="absolute" 
          top="$2" 
          right="$2" 
          backgroundColor="rgba(255,255,255,0.9)"
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <SizableText fontWeight="700" color="$color9">₪ {item.price}</SizableText>
        </YStack>
        <YStack position="absolute" top="$2" left="$2">
          <Button circular size="$2" backgroundColor="white" icon={<Heart size={16} color="$red9" fill="$red9" />} />
        </YStack>
      </Card.Header>
      <YStack padding="$4" gap="$1">
        <H3 textAlign="right">{item.title_ar}</H3>
        <XStack justifyContent="flex-end" alignItems="center" gap="$2">
          <SizableText color="$color11">{item.neighborhood_ar}</SizableText>
          <MapPin size={14} color="$color11" />
        </XStack>
      </YStack>
    </Card>
  );

  if (isAuthLoading) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <SizableText>جاري التحميل...</SizableText>
      </View>
    );
  }

  if (!user) {
    return (
      <View flex={1} backgroundColor="$background" padding="$10" justifyContent="center" alignItems="center">
          <Heart size={64} color="$color8" marginBottom="$4" />
          <H1 textAlign="center">المفضلة</H1>
          <Paragraph textAlign="center" color="$color11" marginTop="$2" marginBottom="$6">
            سجل دخولك لتتمكن من حفظ عقاراتك المفضلة والوصول إليها لاحقاً
          </Paragraph>
          <Button backgroundColor="$color9" color="white" onPress={() => router.push('/profile')}>
            تسجيل الدخول
          </Button>
        </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background" paddingTop="$8">
      <H1 textAlign="right" paddingHorizontal="$4" marginBottom="$6">المفضلة</H1>
      
      <FlatList
        data={favoriteListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <YStack padding="$10" alignItems="center">
              <SizableText color="$color11">ليس لديك أي عقارات مفضلة حالياً</SizableText>
              <Button variant="outline" marginTop="$4" onPress={() => router.push('/explore')}>
                استكشف العقارات
              </Button>
            </YStack>
          ) : null
        }
      />
    </View>
  );
}
