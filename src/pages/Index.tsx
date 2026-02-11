import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Screen = 'auth' | 'chats' | 'search' | 'channels' | 'profile' | 'settings' | 'chat';

interface Chat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const Index = () => {
  const [screen, setScreen] = useState<Screen>('auth');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [username, setUsername] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isDeveloper, setIsDeveloper] = useState(false);

  const mockChats: Chat[] = [
    {
      id: '1',
      name: 'Анна Иванова',
      username: '@anna_iv',
      avatar: '',
      lastMessage: 'Привет! Как дела?',
      time: '14:32',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Максим',
      username: '@max_dev',
      avatar: '',
      lastMessage: 'Отправил файлы',
      time: '12:15',
      unread: 0,
      online: false,
    },
    {
      id: '3',
      name: 'Мария',
      username: '@maria_design',
      avatar: '',
      lastMessage: 'Посмотри новый дизайн',
      time: 'Вчера',
      unread: 5,
      online: true,
    },
  ];

  const mockMessages: Message[] = [
    { id: '1', text: 'Привет!', sent: false, time: '14:30' },
    { id: '2', text: 'Как дела?', sent: false, time: '14:32' },
    { id: '3', text: 'Отлично, спасибо!', sent: true, time: '14:33' },
    { id: '4', text: 'А у тебя?', sent: true, time: '14:33' },
  ];

  const handleRegister = () => {
    if (!phoneNumber || !userName || !username) {
      toast.error('Заполните все поля');
      return;
    }
    if (promoCode === 'super123q') {
      setIsDeveloper(true);
      toast.success('🎉 Промокод активирован! Получена галочка разработчика');
    }
    toast.success('Регистрация успешна!');
    setScreen('chats');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(isDarkMode ? 'Светлая тема' : 'Темная тема');
  };

  const openChat = (chat: Chat) => {
    setActiveChat(chat);
    setScreen('chat');
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    toast.success('Сообщение отправлено');
    setMessageInput('');
  };

  if (screen === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
              <Icon name="MessageCircle" size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Messenger
            </h1>
            <p className="text-muted-foreground mt-2">Быстрая и безопасная связь</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Номер телефона</label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Имя</label>
              <Input
                placeholder="Ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input
                placeholder="@username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Промокод (необязательно)</label>
              <Input
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <Button onClick={handleRegister} className="w-full h-12 text-base font-medium" size="lg">
              Зарегистрироваться
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Защита от DDoS-атак обеспечивается Cloudflare
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (screen === 'chat' && activeChat) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center gap-3 p-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setScreen('chats')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              {activeChat.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold">{activeChat.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {activeChat.online && <span className="w-2 h-2 rounded-full bg-green-500" />}
              {activeChat.online ? 'онлайн' : 'был(а) недавно'}
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.sent
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Icon name="Paperclip" size={20} />
            </Button>
            <Input
              placeholder="Сообщение..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Icon name="Smile" size={20} />
            </Button>
            <Button size="icon" onClick={sendMessage}>
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messenger
          </h1>
          {isDeveloper && (
            <Badge className="bg-gradient-to-r from-primary to-secondary">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Разработчик
            </Badge>
          )}
        </div>

        {screen === 'search' && (
          <div className="relative animate-fade-in">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по номеру или username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {screen === 'chats' && (
          <div className="divide-y animate-fade-in">
            {mockChats.map((chat, idx) => (
              <div
                key={chat.id}
                onClick={() => openChat(chat)}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                        {chat.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{chat.name}</span>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <Badge className="bg-primary text-xs ml-2">{chat.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {screen === 'search' && (
          <div className="p-4 animate-fade-in">
            <p className="text-center text-muted-foreground py-8">
              Введите номер телефона или username для поиска
            </p>
          </div>
        )}

        {screen === 'channels' && (
          <div className="p-4 animate-fade-in">
            <Card className="p-6 text-center">
              <Icon name="Radio" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Каналы</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Создавайте каналы для трансляции сообщений
              </p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать канал
              </Button>
            </Card>
          </div>
        )}

        {screen === 'profile' && (
          <div className="p-4 space-y-4 animate-fade-in">
            <Card className="p-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl">
                    {userName[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Icon name="Camera" size={16} className="mr-2" />
                  Изменить фото
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Имя</label>
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Username</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Номер телефона</label>
                  <Input value={phoneNumber} disabled />
                </div>
              </div>
            </Card>
          </div>
        )}

        {screen === 'settings' && (
          <div className="p-4 space-y-4 animate-fade-in">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name={isDarkMode ? 'Moon' : 'Sun'} size={20} />
                  <div>
                    <div className="font-medium">Тема</div>
                    <div className="text-sm text-muted-foreground">
                      {isDarkMode ? 'Темная' : 'Светлая'}
                    </div>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Icon name="Shield" size={20} className="text-primary" />
                <div>
                  <div className="font-medium">Защита Cloudflare</div>
                  <div className="text-sm text-muted-foreground">DDoS-защита активна</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <a
                href="https://t.me/HellwayYT"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <Icon name="MessageSquare" size={20} className="text-primary" />
                <div>
                  <div className="font-medium">Техподдержка</div>
                  <div className="text-sm text-muted-foreground">@HellwayYT</div>
                </div>
              </a>
            </Card>
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-card">
        <div className="flex items-center justify-around p-2">
          <Button
            variant={screen === 'chats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScreen('chats')}
            className="flex-1 transition-all duration-200"
          >
            <Icon name="MessageCircle" size={20} />
          </Button>
          <Button
            variant={screen === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScreen('search')}
            className="flex-1 transition-all duration-200"
          >
            <Icon name="Search" size={20} />
          </Button>
          <Button
            variant={screen === 'channels' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScreen('channels')}
            className="flex-1 transition-all duration-200"
          >
            <Icon name="Radio" size={20} />
          </Button>
          <Button
            variant={screen === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScreen('profile')}
            className="flex-1 transition-all duration-200"
          >
            <Icon name="User" size={20} />
          </Button>
          <Button
            variant={screen === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScreen('settings')}
            className="flex-1 transition-all duration-200"
          >
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
