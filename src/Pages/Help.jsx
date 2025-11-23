import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  ContactSupport as SupportIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  School as TutorialIcon,
  BugReport as BugIcon,
  Lightbulb as IdeaIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SolvedIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  AccountCircle as AccountIcon,
  EnergySavingsLeaf as EnergyIcon
} from '@mui/icons-material';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <TrendingIcon />,
      questions: [
        {
          question: 'How do I start selling my excess solar energy?',
          answer: 'To start selling excess solar energy, first ensure your solar system is connected to our community grid. Then navigate to the Marketplace page, set your selling preferences, and list your available energy. The system will automatically match your energy with buyers in the community.'
        },
        {
          question: 'What are the requirements to participate in energy trading?',
          answer: 'You need: 1) A registered solar energy system, 2) Smart meter installation, 3) Community membership approval, 4) Completed onboarding process. Contact support if you need help meeting these requirements.'
        },
        {
          question: 'How do I connect my solar system to the platform?',
          answer: 'Our technical team will assist with the connection process. Schedule an installation appointment through your dashboard, and our certified technicians will install the necessary monitoring equipment and connect your system to the community grid.'
        }
      ]
    },
    {
      id: 'trading',
      title: 'Energy Trading',
      icon: <EnergyIcon />,
      questions: [
        {
          question: 'How are energy prices determined?',
          answer: 'Prices are determined by market supply and demand. Factors include: time of day, overall community production, weather conditions, and grid demand. You can set minimum selling prices or use auto-pricing based on market rates.'
        },
        {
          question: 'What is the transaction fee?',
          answer: 'We charge a 2% transaction fee on all energy trades. This fee covers platform maintenance, grid management, and customer support services. There are no hidden charges or monthly fees.'
        },
        {
          question: 'Can I set automatic trading rules?',
          answer: 'Yes! Use our auto-trading feature to set rules like "Sell when price exceeds $0.15/kWh" or "Always keep 10 kWh in reserve." These rules help optimize your energy sales without manual intervention.'
        }
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      icon: <PaymentIcon />,
      questions: [
        {
          question: 'How and when do I get paid?',
          answer: 'Payments are processed weekly every Monday. Earnings are transferred to your registered bank account or can be held as platform credit. You can view your payment history in the Transactions section.'
        },
        {
          question: 'What payment methods are supported?',
          answer: 'We support bank transfers, digital wallets, and platform credits. You can also choose to receive payment in energy credits for future consumption within the community.'
        },
        {
          question: 'How are taxes handled?',
          answer: 'We provide detailed transaction reports for tax purposes. For commercial-scale producers, we recommend consulting with a tax professional. The platform automatically generates annual tax statements.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: <BugIcon />,
      questions: [
        {
          question: 'What should I do if my energy monitor stops working?',
          answer: 'First, try restarting your monitoring device. If the issue persists, contact our 24/7 technical support. Most issues can be resolved remotely within 2 hours.'
        },
        {
          question: 'How accurate is the energy monitoring?',
          answer: 'Our smart meters have 99.5% accuracy and are certified by relevant authorities. Real-time data updates every 5 minutes, and you can view detailed historical data in your dashboard.'
        },
        {
          question: 'What happens during a power outage?',
          answer: 'During outages, the system automatically switches to backup protocols. Your stored energy can be used for critical loads, and the trading platform pauses until normal operations resume.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: <AccountIcon />,
      questions: [
        {
          question: 'How do I update my personal information?',
          answer: 'Navigate to Account Settings → Personal Information. You can update your contact details, payment methods, and notification preferences. Some changes may require verification.'
        },
        {
          question: 'Can I have multiple properties on one account?',
          answer: 'Yes, you can manage multiple solar installations under one account. Each property has its own dashboard and can be configured with different trading preferences.'
        },
        {
          question: 'How do I close my account?',
          answer: 'Contact customer support to initiate account closure. Note: All pending transactions must be completed, and any balance will be paid out before closure.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: <SecurityIcon />,
      questions: [
        {
          question: 'Is my personal and financial data secure?',
          answer: 'Yes, we use bank-level encryption and comply with data protection regulations. Your financial information is stored with PCI-DSS compliant partners, and we never share your data without consent.'
        },
        {
          question: 'What safety measures are in place for the energy grid?',
          answer: 'Our system includes multiple safety protocols: automatic shutoff during faults, real-time monitoring, certified equipment, and regular safety audits by independent authorities.'
        }
      ]
    }
  ];

  const popularArticles = [
    { title: 'Maximizing Your Solar Energy Profits', views: '2.4k', category: 'trading' },
    { title: 'Understanding Smart Meter Installation', views: '1.8k', category: 'technical' },
    { title: 'Tax Benefits for Solar Energy Producers', views: '1.5k', category: 'billing' },
    { title: 'Setting Up Auto-Trading Rules', views: '1.3k', category: 'trading' }
  ];

  const supportChannels = [
    {
      icon: <ChatIcon />,
      title: 'Live Chat',
      description: 'Instant help from our support team',
      availability: 'Available 24/7',
      action: 'Start Chat'
    },
    {
      icon: <EmailIcon />,
      title: 'Email Support',
      description: 'Detailed assistance via email',
      availability: 'Response within 4 hours',
      action: 'Send Email'
    },
    {
      icon: <PhoneIcon />,
      title: 'Phone Support',
      description: 'Talk directly with our experts',
      availability: 'Mon-Fri, 8AM-8PM EST',
      action: 'Call Now'
    },
    {
      icon: <ScheduleIcon />,
      title: 'Schedule Call',
      description: 'Book a callback at your convenience',
      availability: 'Next available slot',
      action: 'Schedule'
    }
  ];

  const filteredFAQs = faqCategories.filter(category => 
    selectedCategory === 'all' || category.id === selectedCategory
  ).flatMap(category => 
    category.questions.map(q => ({
      ...q,
      category: category.title
    }))
  ).filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Help & Support Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Find answers to common questions, learn how to maximize your solar energy trading, and get support when you need it
        </Typography>

        {/* Search Bar */}
        <Paper sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search for answers... (e.g., 'billing', 'trading', 'technical issues')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                padding: '4px'
              }
            }}
          />
        </Paper>

        {/* Quick Category Filters */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
          <Chip
            label="All Topics"
            variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategory('all')}
          />
          {faqCategories.map(category => (
            <Chip
              key={category.id}
              label={category.title}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content - FAQs */}
        <Grid item xs={12} lg={8}>
          {/* Search Results */}
          {searchQuery && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Results for "{searchQuery}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Found {filteredFAQs.length} results
                </Typography>
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((item, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box>
                          <Typography variant="subtitle1">{item.question}</Typography>
                          <Chip label={item.category} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {item.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Alert severity="info">
                    No results found for "{searchQuery}". Try different keywords or contact our support team.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category FAQs */}
          {!searchQuery && faqCategories.map(category => (
            <Card key={category.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  {category.icon}
                  <Typography variant="h5">{category.title}</Typography>
                </Box>
                {category.questions.map((item, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {item.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Support Channels */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Get Help Now
              </Typography>
              <List sx={{ p: 0 }}>
                {supportChannels.map((channel, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {channel.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={channel.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {channel.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {channel.availability}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button variant="outlined" size="small">
                      {channel.action}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Popular Articles */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Articles
              </Typography>
              <List sx={{ p: 0 }}>
                {popularArticles.map((article, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <ArticleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={article.title}
                      secondary={`${article.views} views`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Resources
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <VideoIcon />
                  </ListItemIcon>
                  <ListItemText primary="Video Tutorials" secondary="Step-by-step guides" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <TutorialIcon />
                  </ListItemIcon>
                  <ListItemText primary="Beginner's Guide" secondary="Start trading efficiently" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <IdeaIcon />
                  </ListItemIcon>
                  <ListItemText primary="Tips & Best Practices" secondary="Maximize your profits" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Emergency Alert */}
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="subtitle2">Emergency Support</Typography>
            <Typography variant="body2">
              For urgent technical issues affecting safety or system operation, call our 24/7 emergency line immediately.
            </Typography>
            <Button variant="contained" size="small" sx={{ mt: 1 }}>
              Emergency Contact
            </Button>
          </Alert>
        </Grid>
      </Grid>

      {/* Bottom CTA */}
      <Paper sx={{ p: 4, textAlign: 'center', mt: 4, bgcolor: 'background.default' }}>
        <SupportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Still need help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Our dedicated support team is here to assist you with any questions or issues
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" size="large" startIcon={<ChatIcon />}>
            Contact Support
          </Button>
          <Button variant="outlined" size="large" startIcon={<EmailIcon />}>
            Send Message
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HelpCenter;