import React from 'react';
import { RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { 
  YStack, 
  XStack, 
  H1, 
  H2, 
  H3,
  Paragraph, 
  ScrollView, 
  Button, 
  Input, 
  Card, 
  Image, 
  Theme,
  SizableText,
  View,
  Search,
  MapPin,
  Heart,
  ChevronLeft
} from '@blinkdotnew/mobile-ui';
import { blink } from '@/lib/blink';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: async () => {
      const { data } = await blink.db.listings.list({ limit: 5 });
      return data;
    },
  });

  return (
    <View flex={1} backgroundColor="$background">
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        >
          {/* Hero Section */}
          <YStack 
            paddingHorizontal="$4" 
            paddingTop="$8" 
            paddingBottom="$6"
            backgroundColor="$color9"
            borderBottomLeftRadius="$6"
            borderBottomRightRadius="$6"
          >
            <H1 color="white" textAlign="right" marginBottom="$1">
              ابحث عن منزلك القادم
            </H1>
            <Paragraph color="rgba(255,255,255,0.8)" textAlign="right" marginBottom="$4">
              اكتشف أفضل العقارات للإيجار في مدينة القدس
            </Paragraph>
            
            <XStack 
              backgroundColor="white" 
              borderRadius="$10" 
              paddingHorizontal="$4" 
              alignItems="center"
              height={50}
            >
              <Input 
                flex={1} 
                borderWidth={0} 
                backgroundColor="transparent" 
                placeholder="ابحث عن حي، سعر، أو غرف..."
                textAlign="right"
                placeholderTextColor="$color8"
              />
              <Search size={20} color="$color9" />
            </XStack>
          </YStack>

          {/* Neighborhoods Quick Access */}
          <YStack padding="$4">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Button chromeless padding={0}>
                <XStack alignItems="center">
                  <SizableText color="$color9" fontWeight="600">مشاهدة الكل</SizableText>
                  <ChevronLeft size={16} color="$color9" />
                </XStack>
              </Button>
              <H2 textAlign="right">أحياء مميزة</H2>
            </XStack>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row-reverse' }}>
              {['بيت حنينا', 'شعفاط', 'الشيخ جراح', 'البلدة القديمة', 'التلة الفرنسية'].map((n) => (
                <Button 
                  key={n}
                  marginHorizontal="$1"
                  borderRadius="$10"
                  backgroundColor="white"
                  borderColor="$borderColor"
                  borderWidth={1}
                  onPress={() => router.push({ pathname: '/explore', params: { neighborhood: n } })}
                >
                  <SizableText color="$color12">{n}</SizableText>
                </Button>
              ))}
            </ScrollView>
          </YStack>

          {/* Featured Listings */}
          <YStack paddingHorizontal="$4">
            <H2 textAlign="right" marginBottom="$3">عقارات مختارة</H2>
            
            {isLoading ? (
              <YStack gap="$4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} height={250} backgroundColor="white" borderRadius="$4" />
                ))}
              </YStack>
            ) : (
              <YStack gap="$4">
                {listings?.map((item: any) => (
                  <Card 
                    key={item.id} 
                    onPress={() => router.push(`/listing/${item.id}`)}
                    backgroundColor="white"
                    borderRadius="$4"
                    overflow="hidden"
                    elevation={4}
                  >
                    <Card.Header padding={0}>
                      <Image 
                        source={{ uri: JSON.parse(item.photos || '[]')[0] }} 
                        width="100%" 
                        height={180} 
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
                    </Card.Header>
                    <YStack padding="$4" gap="$1">
                      <H3 textAlign="right">{item.title_ar}</H3>
                      <XStack justifyContent="flex-end" alignItems="center" gap="$2">
                        <SizableText color="$color11">{item.neighborhood_ar}</SizableText>
                        <MapPin size={14} color="$color11" />
                      </XStack>
                      <XStack justifyContent="flex-end" gap="$4" marginTop="$2">
                        <SizableText color="$color10">{item.size_sqm} م²</SizableText>
                        <SizableText color="$color10">{item.rooms} غرف</SizableText>
                      </XStack>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </View>
  );
}
