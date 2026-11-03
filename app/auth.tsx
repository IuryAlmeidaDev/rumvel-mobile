import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
} from 'lucide-react-native';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import { requestPasswordReset } from '@/lib/authApi';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot';

export default function AuthScreen() {
  const { login, loginDemo, register, verifyEmail, resendVerificationCode } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');

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
    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e senha para continuar.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível autenticar. Verifique suas credenciais ou use o Modo Sandbox.'
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
    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha nome, e-mail e senha.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve possuir pelo menos 8 caracteres.');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os Termos de Uso e Política de Privacidade (LGPD).');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        acceptTerms,
      });
      if ('requiresVerification' in result && result.requiresVerification) {
        setInfoMessage(result.message || 'Enviamos um código de 6 dígitos para o seu e-mail.');
        setMode('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.');
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled">
          {/* Brand Header */}
          <View className="mb-6 items-center">
            <Badge
              variant="secondary"
              className="mb-2 border border-primary/30 bg-primary/15 px-3 py-1">
              <Icon as={ShieldCheckIcon} className="mr-1.5 size-3.5 text-primary" />
              <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">
                RUMVEL • COMMITTED BANKING PRECISION
              </Text>
            </Badge>
            <Text className="text-center text-3xl font-extrabold tracking-tight text-foreground">
              Inteligência Financeira Pessoal
            </Text>
            <Text className="mt-1.5 max-w-xs text-center text-xs text-muted-foreground">
              Gestão de contas, orçamentos de alta precisão e alocação por Algoritmo Genético.
            </Text>
          </View>

          <Card className="w-full border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-foreground">
                {mode === 'login'
                  ? 'Acessar sua conta'
                  : mode === 'register'
                    ? 'Criar nova conta'
                    : mode === 'verify'
                      ? 'Verificação de Segurança (OTP)'
                      : 'Recuperar acesso'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {mode === 'login'
                  ? 'Entre com suas credenciais Rumvel ou explore o ambiente Sandbox completo.'
                  : mode === 'register'
                    ? 'Seus dados são protegidos com criptografia e conformidade integral LGPD.'
                    : mode === 'verify'
                      ? `Digite o código enviado para ${email || 'seu e-mail'}.`
                      : 'Enviaremos instruções seguras para redefinição da sua senha.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
              {error ? (
                <View className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <Text className="text-xs font-medium text-destructive">{error}</Text>
                </View>
              ) : null}

              {infoMessage ? (
                <View className="flex-row items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3">
                  <Icon as={CheckCircle2Icon} className="size-4 text-primary" />
                  <Text className="flex-1 text-xs font-medium text-foreground">{infoMessage}</Text>
                </View>
              ) : null}

              {mode === 'register' ? (
                <View className="gap-1.5">
                  <Label nativeID="auth-name">Nome completo</Label>
                  <Input
                    placeholder="Ex: Iury Almeida"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              ) : null}

              {mode !== 'verify' ? (
                <View className="gap-1.5">
                  <Label nativeID="auth-email">E-mail</Label>
                  <Input
                    placeholder="voce@exemplo.com.br"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              ) : null}

              {mode === 'login' || mode === 'register' ? (
                <View className="gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <Label nativeID="auth-password">Senha</Label>
                    {mode === 'login' ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        onPress={() => switchMode('forgot')}>
                        <Text className="text-xs text-primary">Esqueci minha senha</Text>
                      </Button>
                    ) : null}
                  </View>
                  <Input
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              ) : null}

              {mode === 'register' ? (
                <View className="mt-1 flex-row items-start gap-2.5 rounded-lg border border-border bg-background/60 p-3">
                  <Checkbox
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-0.5"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-xs leading-relaxed text-foreground"
                      onPress={() => setAcceptTerms(!acceptTerms)}>
                      Concordo com os Termos de Uso e autorizo o processamento dos dados conforme a{' '}
                      <Text className="font-bold text-primary">Lei Geral de Proteção de Dados (LGPD)</Text>.
                    </Text>
                  </View>
                </View>
              ) : null}

              {mode === 'verify' ? (
                <View className="gap-2">
                  <Label nativeID="auth-otp">Código de 6 dígitos</Label>
                  <Input
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    className="text-center text-lg font-bold tracking-widest"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => void handleResendOtp()}
                    disabled={loading}>
                    <Text className="text-xs text-primary">Reenviar código de verificação</Text>
                  </Button>
                </View>
              ) : null}

              {/* Primary Action Button */}
              {mode === 'login' ? (
                <Button
                  className="mt-1 w-full flex-row items-center justify-center gap-2"
                  onPress={() => void handleLogin()}
                  disabled={loading}>
                  <Icon as={LockIcon} className="size-4 text-primary-foreground" />
                  <Text className="font-bold">
                    {loading ? 'Autenticando...' : 'Entrar na Conta'}
                  </Text>
                </Button>
              ) : mode === 'register' ? (
                <Button
                  className="mt-1 w-full flex-row items-center justify-center gap-2"
                  onPress={() => void handleRegister()}
                  disabled={loading}>
                  <Icon as={UserPlusIcon} className="size-4 text-primary-foreground" />
                  <Text className="font-bold">
                    {loading ? 'Criando conta...' : 'Criar Conta Segura'}
                  </Text>
                </Button>
              ) : mode === 'verify' ? (
                <Button
                  className="mt-1 w-full flex-row items-center justify-center gap-2"
                  onPress={() => void handleVerifyOtp()}
                  disabled={loading}>
                  <Icon as={KeyRoundIcon} className="size-4 text-primary-foreground" />
                  <Text className="font-bold">
                    {loading ? 'Validando...' : 'Confirmar Código'}
                  </Text>
                </Button>
              ) : (
                <Button
                  className="mt-1 w-full flex-row items-center justify-center gap-2"
                  onPress={() => void handleForgotPassword()}
                  disabled={loading}>
                  <Icon as={MailIcon} className="size-4 text-primary-foreground" />
                  <Text className="font-bold">
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                  </Text>
                </Button>
              )}

              {/* Demo Mode Quick Launch */}
              <View className="my-1 flex-row items-center gap-3">
                <Separator className="flex-1" />
                <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  OU ACESSO IMEDIATO
                </Text>
                <Separator className="flex-1" />
              </View>

              <Button
                variant="secondary"
                className="w-full flex-row items-center justify-center gap-2 border border-primary/40 bg-primary/15"
                onPress={() => void handleDemoLogin()}
                disabled={loading}>
                <Icon as={SparklesIcon} className="size-4 text-primary" />
                <Text className="font-bold text-primary">
                  Entrar no Modo Sandbox (Dados Reais Demo)
                </Text>
                <Icon as={ArrowRightIcon} className="size-3.5 text-primary" />
              </Button>
            </CardContent>

            <CardFooter className="flex-col gap-2 border-t border-border pt-4">
              {mode === 'login' ? (
                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-xs text-muted-foreground">Ainda não possui conta?</Text>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onPress={() => switchMode('register')}>
                    <Text className="text-xs font-bold text-primary">Cadastre-se gratuitamente</Text>
                  </Button>
                </View>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onPress={() => switchMode('login')}>
                  <Text className="text-xs font-bold text-primary">
                    Voltar para o Login
                  </Text>
                </Button>
              )}
            </CardFooter>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
