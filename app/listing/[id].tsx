import React, { useState, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  YStack, 
  XStack, 
  ZStack,
  H1, 
  H2, 
  Paragraph, 
  ScrollView, 
  Button, 
  Image, 
  Theme,
  SizableText,
  View,
  MapPin,
  ChevronRight,
  Heart,
  Share2,
  CheckCircle2,
  MessageCircle
} from '@blinkdotnew/mobile-ui';
import { blink } from '@/lib/blink';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      return await blink.db.listings.get(id as string);
    },
  });

  const { data: isFavorited } = useQuery({
    queryKey: ['isFavorited', id, user?.id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const exists = await blink.db.favorites.exists({
        where: { user_id: user.id, listing_id: id as string }
      });
      return exists;
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        router.push('/profile');
        return;
      }
      
      if (isFavorited) {
        await blink.db.favorites.deleteMany({
          where: { user_id: user.id, listing_id: id as string }
        });
      } else {
        await blink.db.favorites.create({
          id: `fav_${Date.now()}`,
          user_id: user.id,
          listing_id: id as string
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFavorited', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const handleWhatsApp = () => {
    const phoneNumber = '+972500000000'; // Placeholder
    const message = `مرحباً، أنا مهتم بعقارك: ${listing.title_ar}`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        Linking.openURL(webUrl);
      }
    });
  };

  if (isLoading || !listing) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <SizableText>جاري التحميل...</SizableText>
      </View>
    );
  }

  const photos = JSON.parse(listing.photos || '[]');
  const amenities = ['مطبخ مجهز', 'تكييف', 'موقف سيارات', 'مصعد', 'شرفة', 'تدفئة'];

  return (
    <View flex={1} backgroundColor="$background">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image Gallery */}
        <ZStack height={350}>
          <Image source={{ uri: photos[0] }} width="100%" height="100%" />
          <YStack position="absolute" top="$8" left="$4" right="$4" flexDirection="row" justifyContent="space-between">
            <Button circular size="$3" backgroundColor="rgba(255,255,255,0.8)" icon={<ChevronRight size={20} />} onPress={() => router.back()} />
            <XStack gap="$2">
              <Button circular size="$3" backgroundColor="rgba(255,255,255,0.8)" icon={<Share2 size={20} />} />
              <Button 
                circular 
                size="$3" 
                backgroundColor="rgba(255,255,255,0.8)" 
                icon={<Heart size={20} color={isFavorited ? "$red9" : "$color11"} fill={isFavorited ? "$red9" : "transparent"} />} 
                onPress={() => toggleFavoriteMutation.mutate()}
              />
            </XStack>
          </YStack>
        </ZStack>

        {/* Content */}
        <YStack padding="$4" gap="$4">
          <YStack gap="$1">
            <H1 textAlign="right">{listing.title_ar}</H1>
            <XStack justifyContent="flex-end" alignItems="center" gap="$2">
              <SizableText color="$color11" size="$5">{listing.neighborhood_ar}</SizableText>
              <MapPin size={18} color="$color11" />
            </XStack>
          </YStack>

          <XStack 
            backgroundColor="white" 
            padding="$4" 
            borderRadius="$4" 
            justifyContent="space-around"
            elevation={2}
          >
            <YStack alignItems="center">
              <SizableText fontWeight="700" size="$6">₪ {listing.price}</SizableText>
              <SizableText color="$color10">شهرياً</SizableText>
            </YStack>
            <YStack alignItems="center">
              <SizableText fontWeight="700" size="$6">{listing.rooms}</SizableText>
              <SizableText color="$color10">غرف</SizableText>
            </YStack>
            <YStack alignItems="center">
              <SizableText fontWeight="700" size="$6">{listing.size_sqm}</SizableText>
              <SizableText color="$color10">م²</SizableText>
            </YStack>
          </XStack>

          <YStack gap="$2">
            <H2 textAlign="right">الوصف</H2>
            <Paragraph textAlign="right" color="$color11" lineHeight={24}>
              {listing.description_ar}
            </Paragraph>
          </YStack>

          <YStack gap="$3">
            <H2 textAlign="right">المرافق والخدمات</H2>
            <XStack flexWrap="wrap" gap="$2" justifyContent="flex-end">
              {amenities.map((item) => (
                <XStack 
                  key={item} 
                  backgroundColor="$color2" 
                  paddingHorizontal="$3" 
                  paddingVertical="$2" 
                  borderRadius="$10"
                  alignItems="center"
                  gap="$2"
                >
                  <SizableText color="$color11">{item}</SizableText>
                  <CheckCircle2 size={14} color="$color9" />
                </XStack>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$2" marginTop="$2">
            <H2 textAlign="right">الموقع</H2>
            <YStack 
              height={200} 
              backgroundColor="$color3" 
              borderRadius="$4" 
              justifyContent="center" 
              alignItems="center"
              borderWidth={1}
              borderColor="$borderColor"
              borderStyle="dashed"
            >
              <MapPin size={32} color="$color10" />
              <SizableText color="$color10" marginTop="$2">خريطة الموقع (قريباً)</SizableText>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Bottom CTA */}
      <XStack 
        position="absolute" 
        bottom={0} 
        left={0} 
        right={0} 
        backgroundColor="white" 
        padding="$4" 
        borderTopWidth={1} 
        borderTopColor="$borderColor"
        justifyContent="space-between"
        alignItems="center"
        paddingBottom={Platform.OS === 'ios' ? 32 : "$4"}
      >
        <Button 
          backgroundColor="#25D366" 
          color="white" 
          flex={1} 
          marginLeft="$4"
          height={50}
          icon={<MessageCircle size={20} />}
          onPress={handleWhatsApp}
        >
          تواصل عبر واتساب
        </Button>
        <YStack>
          <SizableText fontWeight="700" size="$6" color="$color9">₪ {listing.price}</SizableText>
          <SizableText color="$color10" size="$2">شامل الخدمات</SizableText>
        </YStack>
      </XStack>
    </View>
  );
}
