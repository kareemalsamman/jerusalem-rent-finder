import React, { useState, useEffect } from 'react';
import { 
  YStack, 
  XStack, 
  H1, 
  H2, 
  Paragraph, 
  Button, 
  Avatar, 
  Theme,
  SizableText,
  View,
  Settings,
  LogOut,
  ChevronLeft,
  LoginScreen
} from '@blinkdotnew/mobile-ui';
import { blink } from '@/lib/blink';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (!state.isLoading) setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await blink.auth.signOut();
  };

  if (isLoading) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <SizableText>جاري التحميل...</SizableText>
      </View>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        variant="editorial"
        title="أهلاً بك في القدس للعقارات"
        subtitle="سجل دخولك لحفظ عقاراتك المفضلة وإدارة إعلاناتك"
        onProviderPress={async (id) => {
          if (id === 'google') await blink.auth.signInWithGoogle();
        }}
        showEmailForm
        onEmailSubmit={async (email, password) => {
          try {
            await blink.auth.signInWithEmail(email, password);
          } catch (e) {
            await blink.auth.signUp({ email, password });
          }
        }}
      />
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      <YStack paddingHorizontal="$4" paddingTop="$8" paddingBottom="$4" backgroundColor="$color9">
        <XStack justifyContent="space-between" alignItems="center">
          <Button circular chromeless icon={<Settings size={20} color="white" />} />
          <H1 color="white">ملفي الشخصي</H1>
        </XStack>
        
        <YStack alignItems="center" marginTop="$6" gap="$2">
          <Avatar size="$8" circular borderWidth={2} borderColor="white">
            <Avatar.Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }} />
            <Avatar.Fallback backgroundColor="$color2" />
          </Avatar>
          <H2 color="white">{user.displayName || user.email}</H2>
          <Paragraph color="rgba(255,255,255,0.8)">{user.email}</Paragraph>
        </YStack>
      </YStack>

      <YStack padding="$4" gap="$4">
        <YStack backgroundColor="white" borderRadius="$4" padding="$2" elevation={2}>
          <Button 
            chromeless 
            justifyContent="flex-end" 
            iconAfter={<ChevronLeft size={18} color="$color11" />}
            onPress={() => router.push('/favorites')}
          >
            <SizableText size="$4">العقارات المفضلة</SizableText>
          </Button>
          <Button 
            chromeless 
            justifyContent="flex-end" 
            iconAfter={<ChevronLeft size={18} color="$color11" />}
          >
            <SizableText size="$4">إعلاناتي</SizableText>
          </Button>
          <Button 
            chromeless 
            justifyContent="flex-end" 
            iconAfter={<ChevronLeft size={18} color="$color11" />}
          >
            <SizableText size="$4">تنبيهات البحث</SizableText>
          </Button>
        </YStack>

        <Button 
          backgroundColor="$red2" 
          color="$red9" 
          icon={<LogOut size={20} />} 
          onPress={handleSignOut}
          marginTop="$4"
        >
          تسجيل الخروج
        </Button>
      </YStack>
    </View>
  );
}
