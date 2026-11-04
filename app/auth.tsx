import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Svg, { Path } from 'react-native-svg';
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  MoonIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react-native';
import { RumvelLogo } from '@/components/brand/RumvelLogo';
import { RumvelShowcase } from '@/components/brand/RumvelShowcase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import { requestPasswordReset } from '@/lib/authApi';
import { formatProperName } from '@/lib/formatters';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOCIAL_PROVIDERS = [
  {
    name: 'Apple',
    path: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
  },
  {
    name: 'Google',
    path: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z',
  },
  {
    name: 'Meta',
    path: 'M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z',
  },
];

export default function AuthScreen() {
  const { login, loginDemo, register, verifyEmail, resendVerificationCode } = useApp();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [termsModalOpen, setTermsModalOpen] = useState<'terms' | 'privacy' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const switchMode = (nextMode: AuthMode) => {
    setError(null);
    setInfoMessage(null);
    setMode(nextMode);
  };

  const handleLogin = async () => {
    setError(null);
    setInfoMessage(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Formato de e-mail inválido.');
      return;
    }
    if (!password) {
      setError('Por favor, informe sua senha.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: trimmedEmail, password });
    } catch (err: any) {
      if (
        err?.code === 'EMAIL_NOT_VERIFIED' ||
        err?.message?.includes('EMAIL_NOT_VERIFIED') ||
        err?.message?.toLowerCase().includes('não foi verificado')
      ) {
        setMode('verify');
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : 'Credenciais inválidas. Verifique seu e-mail e senha.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      await loginDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar Modo Sandbox.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setInfoMessage(null);
    const trimmedName = formatProperName(name.trim());
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!trimmedEmail) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Formato de e-mail inválido.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!acceptTerms) {
      setError('Você deve aceitar os Termos de Uso e a Política de Privacidade para criar sua conta.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        acceptTerms,
      });
      if ('requiresVerification' in result && result.requiresVerification) {
        setInfoMessage(result.message || 'Enviamos um código de 6 dígitos para o seu e-mail.');
        setMode('verify');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao tentar cadastrar. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setInfoMessage(null);
    if (!otpCode.trim()) {
      setError('Informe o código de verificação recebido por e-mail.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email.trim(), otpCode.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      const res = await resendVerificationCode(email.trim());
      setInfoMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfoMessage(null);
    if (!email.trim()) {
      setError('Informe o seu e-mail cadastrado.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setInfoMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha.');
    } finally {
      setLoading(false);
    }
  };

  const iconMutedColor = isDark ? '#7c8ea1' : '#64748b';
  const placeholderColor = isDark ? '#64748b' : '#94a3b8';
  const textColor = isDark ? '#f3f6fa' : '#0f172a';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow px-4 py-4 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Top Bar matching AuthPage header */}
          <View className="mb-3 w-full max-w-lg flex-row items-center justify-end gap-2 self-center">
            {mode !== 'login' ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 flex-row items-center gap-1.5 px-2.5"
                onPress={() => void handleDemoLogin()}
                disabled={loading}>
                <Icon as={SparklesIcon} className="size-3.5 text-primary" />
                <Text className="text-xs font-medium text-muted-foreground">
                  Modo Demonstração
                </Text>
              </Button>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              accessibilityLabel={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              onPress={toggleColorScheme}>
              <Icon as={isDark ? SunIcon : MoonIcon} className="size-4 text-muted-foreground" />
            </Button>
          </View>

          {/* Main Login Card (Form + RumvelShowcase stacked on mobile, matching web AuthPage) */}
          <Card className="w-full max-w-lg self-center overflow-hidden rounded-[14px] border-border/80 bg-card p-0 shadow-lg">
            {/* Left / Top Column: Auth Form */}
            <View className="p-6">
              {/* Official Honey-Badger Emblem Logo */}
              <View className="mb-5 items-center">
                <RumvelLogo size="xl" />
              </View>

              {/* Heading (No kicker/eyebrow per DESIGN.md) */}
              <Text className="mb-5 text-center text-2xl font-bold tracking-tight text-foreground">
                {mode === 'login'
                  ? 'Acesse sua conta'
                  : mode === 'register'
                    ? 'Criar uma nova conta'
                    : mode === 'verify'
                      ? 'Verifique seu e-mail'
                      : 'Recuperar sua senha'}
              </Text>

              {/* Alerts */}
              {error ? (
                <View className="mb-4 flex-row items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <Icon as={AlertCircleIcon} className="mt-0.5 size-4 text-destructive" />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-destructive">
                      {mode === 'login'
                        ? 'Verifique os dados informados'
                        : mode === 'register'
                          ? 'Erro no cadastro'
                          : 'Atenção'}
                    </Text>
                    <Text className="mt-0.5 text-xs leading-relaxed text-destructive/90">
                      {error}
                    </Text>
                  </View>
                </View>
              ) : null}

              {infoMessage ? (
                <View className="mb-4 flex-row items-center gap-2.5 rounded-lg border border-primary/40 bg-primary/10 p-3">
                  <Icon as={CheckCircle2Icon} className="size-4 text-primary" />
                  <Text className="flex-1 text-xs font-medium leading-relaxed text-foreground">
                    {infoMessage}
                  </Text>
                </View>
              ) : null}

              {/* Form Fields */}
              <View className="gap-4">
                {mode === 'register' ? (
                  <View className="gap-2">
                    <Label nativeID="auth-name">Nome completo</Label>
                    <View className="h-11 flex-row items-center rounded-md border border-input bg-background px-3">
                      <UserIcon size={16} color={iconMutedColor} />
                      <TextInput
                        placeholder="Seu nome completo"
                        placeholderTextColor={placeholderColor}
                        value={name}
                        onChangeText={(v) => {
                          setName(v);
                          if (error) setError(null);
                        }}
                        autoCapitalize="words"
                        editable={!loading}
                        style={{ color: textColor }}
                        className="ml-2.5 flex-1 text-sm"
                      />
                    </View>
                  </View>
                ) : null}

                {mode !== 'verify' ? (
                  <View className="gap-2">
                    <Label nativeID="auth-email">E-mail</Label>
                    <View className="h-11 flex-row items-center rounded-md border border-input bg-background px-3">
                      <MailIcon size={16} color={iconMutedColor} />
                      <TextInput
                        placeholder="seu@email.com"
                        placeholderTextColor={placeholderColor}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(v) => {
                          setEmail(v);
                          if (error) setError(null);
                        }}
                        editable={!loading}
                        style={{ color: textColor }}
                        className="ml-2.5 flex-1 text-sm"
                      />
                    </View>
                  </View>
                ) : null}

                {mode === 'login' ? (
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Label nativeID="auth-password">Senha</Label>
                      <Pressable
                        onPress={() => switchMode('forgot')}
                        accessibilityRole="button">
                        <Text className="text-xs font-medium text-primary">
                          Esqueceu sua senha?
                        </Text>
                      </Pressable>
                    </View>
                    <View className="h-11 flex-row items-center rounded-md border border-input bg-background px-3">
                      <LockIcon size={16} color={iconMutedColor} />
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor={placeholderColor}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(v) => {
                          setPassword(v);
                          if (error) setError(null);
                        }}
                        editable={!loading}
                        style={{ color: textColor }}
                        className="ml-2.5 flex-1 text-sm"
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        className="p-1.5">
                        {showPassword ? (
                          <EyeOffIcon size={16} color={iconMutedColor} />
                        ) : (
                          <EyeIcon size={16} color={iconMutedColor} />
                        )}
                      </Pressable>
                    </View>
                    <Text className="text-xs leading-relaxed text-muted-foreground">
                      Sua chave pessoal de acesso ao Rumvel.
                    </Text>
                  </View>
                ) : null}

                {mode === 'register' ? (
                  <View className="gap-3">
                    <View className="gap-2">
                      <Label nativeID="reg-password">Senha</Label>
                      <View className="h-11 flex-row items-center rounded-md border border-input bg-background px-3">
                        <LockIcon size={16} color={iconMutedColor} />
                        <TextInput
                          placeholder="Sua senha"
                          placeholderTextColor={placeholderColor}
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={(v) => {
                            setPassword(v);
                            if (error) setError(null);
                          }}
                          editable={!loading}
                          style={{ color: textColor }}
                          className="ml-2.5 flex-1 text-sm"
                        />
                        <Pressable
                          onPress={() => setShowPassword(!showPassword)}
                          accessibilityLabel={showPassword ? 'Ocultar senha' : 'Ver senha'}
                          className="p-1.5">
                          {showPassword ? (
                            <EyeOffIcon size={16} color={iconMutedColor} />
                          ) : (
                            <EyeIcon size={16} color={iconMutedColor} />
                          )}
                        </Pressable>
                      </View>
                    </View>

                    <View className="gap-2">
                      <Label nativeID="reg-confirm-password">Confirmar Senha</Label>
                      <View className="h-11 flex-row items-center rounded-md border border-input bg-background px-3">
                        <LockIcon size={16} color={iconMutedColor} />
                        <TextInput
                          placeholder="Repita a senha"
                          placeholderTextColor={placeholderColor}
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={(v) => {
                            setConfirmPassword(v);
                            if (error) setError(null);
                          }}
                          editable={!loading}
                          style={{ color: textColor }}
                          className="ml-2.5 flex-1 text-sm"
                        />
                        <Pressable
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={
                            showConfirmPassword
                              ? 'Ocultar confirmação de senha'
                              : 'Ver confirmação de senha'
                          }
                          className="p-1.5">
                          {showConfirmPassword ? (
                            <EyeOffIcon size={16} color={iconMutedColor} />
                          ) : (
                            <EyeIcon size={16} color={iconMutedColor} />
                          )}
                        </Pressable>
                      </View>
                      <Text className="text-xs leading-relaxed text-muted-foreground">
                        Use pelo menos 8 caracteres.
                      </Text>
                    </View>

                    {/* Terms & LGPD Checkbox */}
                    <View className="flex-row items-start gap-3 pt-1">
                      <Checkbox
                        checked={acceptTerms}
                        onCheckedChange={(v) => {
                          setAcceptTerms(v);
                          if (error) setError(null);
                        }}
                        className="mt-1"
                      />
                      <View className="flex-1 gap-1">
                        <Text
                          className="text-sm leading-relaxed text-foreground"
                          onPress={() => setAcceptTerms(!acceptTerms)}>
                          Concordo com os Termos de Uso e a Política de Privacidade.
                        </Text>
                        <Text className="text-xs leading-relaxed text-muted-foreground">
                          Leia os{' '}
                          <Text
                            className="font-semibold text-primary underline"
                            onPress={() => setTermsModalOpen('terms')}>
                            Termos de Uso
                          </Text>{' '}
                          e a{' '}
                          <Text
                            className="font-semibold text-primary underline"
                            onPress={() => setTermsModalOpen('privacy')}>
                            Política de Privacidade
                          </Text>{' '}
                          (LGPD).
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                {mode === 'verify' ? (
                  <View className="gap-3">
                    <Text className="text-center text-xs leading-relaxed text-muted-foreground">
                      Enviamos um código de 6 dígitos para{' '}
                      <Text className="font-semibold text-foreground">
                        {email || 'seu e-mail'}
                      </Text>
                      .
                    </Text>
                    <View className="h-12 flex-row items-center rounded-md border border-input bg-background px-3">
                      <KeyRoundIcon size={16} color={iconMutedColor} />
                      <TextInput
                        placeholder="000000"
                        placeholderTextColor={placeholderColor}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        editable={!loading}
                        style={{ color: textColor, letterSpacing: 6 }}
                        className="ml-2.5 flex-1 text-center text-lg font-bold"
                      />
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => void handleResendOtp()}
                        disabled={loading}>
                        <Text className="text-xs text-primary">Reenviar código</Text>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => switchMode('register')}
                        disabled={loading}>
                        <Text className="text-xs text-muted-foreground">Alterar e-mail</Text>
                      </Button>
                    </View>
                  </View>
                ) : null}

                {mode === 'forgot' ? (
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    Informe seu e-mail cadastrado e enviaremos um link seguro para redefinir sua
                    senha de acesso ao Rumvel.
                  </Text>
                ) : null}

                {/* Primary Submit Button */}
                {mode === 'login' ? (
                  <Button
                    className="h-11 w-full flex-row items-center justify-center gap-2"
                    onPress={() => void handleLogin()}
                    disabled={loading}>
                    <Text className="text-sm font-semibold text-primary-foreground">
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Text>
                  </Button>
                ) : mode === 'register' ? (
                  <Button
                    className="h-11 w-full flex-row items-center justify-center gap-2"
                    onPress={() => void handleRegister()}
                    disabled={loading}>
                    <Text className="text-sm font-semibold text-primary-foreground">
                      {loading ? 'Criando conta...' : 'Criar minha conta'}
                    </Text>
                  </Button>
                ) : mode === 'verify' ? (
                  <Button
                    className="h-11 w-full flex-row items-center justify-center gap-2"
                    onPress={() => void handleVerifyOtp()}
                    disabled={loading}>
                    <Text className="text-sm font-semibold text-primary-foreground">
                      {loading ? 'Validando...' : 'Confirmar código'}
                    </Text>
                  </Button>
                ) : (
                  <Button
                    className="h-11 w-full flex-row items-center justify-center gap-2"
                    onPress={() => void handleForgotPassword()}
                    disabled={loading}>
                    <Text className="text-sm font-semibold text-primary-foreground">
                      {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                    </Text>
                  </Button>
                )}

                {/* Other Access Options */}
                {mode === 'login' ? (
                  <>
                    <View className="my-1 flex-row items-center gap-3">
                      <Separator className="flex-1" />
                      <Text className="text-xs text-muted-foreground">
                        Outras formas de acesso
                      </Text>
                      <Separator className="flex-1" />
                    </View>

                    {/* Social Login Buttons (Apple, Google, Meta) */}
                    <View className="gap-2">
                      <View className="flex-row gap-3">
                        {SOCIAL_PROVIDERS.map((provider) => (
                          <Button
                            key={provider.name}
                            variant="outline"
                            disabled
                            accessibilityLabel={`Continuar com ${provider.name}`}
                            className="h-11 flex-1 items-center justify-center opacity-50">
                            <Svg width={18} height={18} viewBox="0 0 24 24">
                              <Path d={provider.path} fill={textColor} />
                            </Svg>
                          </Button>
                        ))}
                      </View>
                      <Text className="text-center text-xs text-muted-foreground/90">
                        Apple, Google e Meta em breve no aplicativo.
                      </Text>
                    </View>

                    {/* Interactive Sandbox Button for Immediate Testing */}
                    <Button
                      variant="secondary"
                      className="mt-1 h-11 w-full flex-row items-center justify-center gap-2 border border-primary/35 bg-primary/12"
                      onPress={() => void handleDemoLogin()}
                      disabled={loading}>
                      <Icon as={SparklesIcon} className="size-4 text-primary" />
                      <Text className="text-xs font-semibold text-primary">
                        Explorar Ambiente Demonstração (Sandbox)
                      </Text>
                      <Icon as={ArrowRightIcon} className="size-3.5 text-primary" />
                    </Button>
                  </>
                ) : null}

                {/* Footer Switch Link */}
                <View className="mt-2 flex-row flex-wrap items-center justify-center gap-1.5 pt-1">
                  {mode === 'login' ? (
                    <>
                      <Text className="text-sm text-muted-foreground">Ainda não tem conta?</Text>
                      <Pressable
                        onPress={() => switchMode('register')}
                        accessibilityRole="button"
                        className="py-1">
                        <Text className="text-sm font-semibold text-primary">
                          Criar uma conta
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Text className="text-sm text-muted-foreground">Já possui uma conta?</Text>
                      <Pressable
                        onPress={() => switchMode('login')}
                        accessibilityRole="button"
                        className="py-1">
                        <Text className="text-sm font-semibold text-primary">Entrar</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Right / Bottom Column: Official RumvelShowcase Mascot Panel */}
            <RumvelShowcase />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms of Use & LGPD Privacy Modal (identical to web AuthPage) */}
      <Dialog
        open={Boolean(termsModalOpen)}
        onOpenChange={(open) => !open && setTermsModalOpen(null)}>
        <DialogContent className="max-h-[85%] w-[94%] max-w-lg border-border bg-card p-5">
          <DialogHeader>
            <View className="flex-row items-center gap-2">
              <Icon
                as={termsModalOpen === 'terms' ? FileTextIcon : ShieldCheckIcon}
                className="size-5 text-primary"
              />
              <DialogTitle className="text-base font-bold text-foreground">
                {termsModalOpen === 'terms'
                  ? 'Termos de Uso do Rumvel'
                  : 'Política de Privacidade (LGPD)'}
              </DialogTitle>
            </View>
            <DialogDescription className="text-xs text-muted-foreground">
              {termsModalOpen === 'terms'
                ? 'Transparência total sobre direitos, deveres e funcionamento da plataforma.'
                : 'Como tratamos, protegemos e garantimos a privacidade dos seus dados financeiros.'}
            </DialogDescription>
          </DialogHeader>

          {/* Tab switcher inside modal */}
          <View className="flex-row border-b border-border">
            <Pressable
              onPress={() => setTermsModalOpen('terms')}
              className={`border-b-2 px-3 py-2 ${
                termsModalOpen === 'terms' ? 'border-primary' : 'border-transparent'
              }`}>
              <Text
                className={`text-xs ${
                  termsModalOpen === 'terms'
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                }`}>
                Termos de Uso
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTermsModalOpen('privacy')}
              className={`border-b-2 px-3 py-2 ${
                termsModalOpen === 'privacy' ? 'border-primary' : 'border-transparent'
              }`}>
              <Text
                className={`text-xs ${
                  termsModalOpen === 'privacy'
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                }`}>
                Privacidade LGPD
              </Text>
            </Pressable>
          </View>

          <ScrollView className="max-h-[320px] py-2">
            {termsModalOpen === 'terms' ? (
              <View className="gap-3">
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    1. Finalidade do Serviço
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    O Rumvel é uma ferramenta de gestão e inteligência financeira pessoal. Seu
                    objetivo é apoiar o usuário no planejamento, organização e visualização de seus
                    recursos e metas, não constituindo recomendação formal ou garantia de retorno de
                    investimentos.
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    2. Não Compartilhamento e Sigilo Financeiro
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    Seus dados financeiros não são vendidos, alugados ou cedidos para anunciantes ou
                    terceiros. A custódia e o processamento ocorrem exclusivamente para viabilizar
                    as funcionalidades da sua conta.
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    3. Responsabilidade pelas Informações
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    O usuário é responsável pela exatidão dos dados inseridos e pela
                    confidencialidade de sua senha e credenciais de acesso. O Rumvel emprega
                    criptografia e boas práticas de proteção contra acessos não autorizados.
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    4. Encerramento e Exclusão de Conta
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    Você pode solicitar a exclusão de seus dados e o cancelamento de sua conta a
                    qualquer momento na aba de contas ou pelo suporte oficial.
                  </Text>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    1. Compromisso com a LGPD
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    O Rumvel atua em estrita conformidade com a Lei Geral de Proteção de Dados (Lei
                    nº 13.709/2018), tratando seus dados com transparência, segurança técnica e
                    finalidade legítima.
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    2. Dados Pessoais Coletados
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    Coletamos apenas o estritamente necessário: nome, e-mail e credenciais de
                    autenticação, além dos registros financeiros (contas, lançamentos, orçamentos e
                    metas) que você decide gerenciar na plataforma.
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    3. Armazenamento e Segurança
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    Suas credenciais são protegidas com algoritmos seguros de hashing e suas sessões
                    utilizam tokens autenticados com expiração controlada. Não armazenamos senhas em
                    texto puro.
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm font-semibold text-foreground">
                    4. Seus Direitos como Titular
                  </Text>
                  <Text className="text-xs leading-relaxed text-muted-foreground">
                    Você tem o direito de confirmar a existência de tratamento, acessar, corrigir,
                    portar ou solicitar a anonimização e exclusão total dos seus dados de nossa base
                    a qualquer instante.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <DialogFooter className="pt-2">
            <Button onPress={() => setTermsModalOpen(null)}>
              <Text className="text-xs font-semibold text-primary-foreground">
                Entendi e fechar
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
