import React, { useState } from 'react';
import { RefreshControl, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { 
  YStack, 
  XStack, 
  H2, 
  H3,
  Button, 
  Input, 
  Card, 
  Image, 
  Theme,
  SizableText,
  View,
  Search,
  MapPin,
  Filter,
  X
} from '@blinkdotnew/mobile-ui';
import { blink } from '@/lib/blink';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(params.neighborhood as string || null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['listings', 'explore', selectedNeighborhood, searchQuery],
    queryFn: async () => {
      let query: any = { where: {} };
      
      if (selectedNeighborhood) {
        query.where.neighborhood_ar = selectedNeighborhood;
      }
      
      const { data } = await blink.db.listings.list(query);
      return data;
    },
  });

  const neighborhoods = ['بيت حنينا', 'شعفاط', 'الشيخ جراح', 'البلدة القديمة', 'التلة الفرنسية', 'سلوان', 'تلبيوت'];

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
  );

  return (
    <View flex={1} backgroundColor="$background" paddingTop="$8">
        {/* Search & Filter Header */}
        <YStack paddingHorizontal="$4" marginBottom="$4" gap="$3">
          <XStack gap="$2" alignItems="center">
            <Button 
              circular 
              icon={<Filter size={20} />} 
              onPress={() => setShowFilters(!showFilters)}
              backgroundColor={showFilters ? "$color9" : "white"}
              color={showFilters ? "white" : "$color9"}
              elevation={2}
            />
            <XStack 
              flex={1}
              backgroundColor="white" 
              borderRadius="$10" 
              paddingHorizontal="$4" 
              alignItems="center"
              height={50}
              elevation={2}
            >
              <Input 
                flex={1} 
                borderWidth={0} 
                backgroundColor="transparent" 
                placeholder="ابحث عن منزل..."
                textAlign="right"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Search size={20} color="$color9" />
            </XStack>
          </XStack>

          {showFilters && (
            <YStack backgroundColor="white" padding="$4" borderRadius="$4" elevation={4} gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Button circular size="$2" chromeless icon={<X size={16} />} onPress={() => setShowFilters(false)} />
                <SizableText fontWeight="700">تصفية حسب الحي</SizableText>
              </XStack>
              <XStack flexWrap="wrap" gap="$2" justifyContent="flex-end">
                {neighborhoods.map((n) => (
                  <Button 
                    key={n}
                    size="$3"
                    borderRadius="$10"
                    backgroundColor={selectedNeighborhood === n ? "$color9" : "$color2"}
                    color={selectedNeighborhood === n ? "white" : "$color11"}
                    onPress={() => setSelectedNeighborhood(selectedNeighborhood === n ? null : n)}
                  >
                    {n}
                  </Button>
                ))}
              </XStack>
              <Button 
                backgroundColor="$color9" 
                color="white" 
                onPress={() => setShowFilters(false)}
                marginTop="$2"
              >
                تطبيق
              </Button>
            </YStack>
          )}
        </YStack>

        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <YStack padding="$10" alignItems="center">
                <SizableText color="$color11">لا توجد عقارات تطابق بحثك</SizableText>
              </YStack>
            ) : null
          }
        />
      </View>
  );
}
