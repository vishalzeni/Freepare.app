import { Typography, Card, Container, Box } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { keyframes } from '@emotion/react';
import {
  EmojiPeople,
  Verified,
  School,
  MonetizationOn,
  Timer,
  Public,
  OndemandVideo,
} from '@mui/icons-material';


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const iconAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const colors = {
  primary: '#066C98',
  secondary: '#ff4081',
  background: '#f5f5f5',
  text: '#333',
  icons: ['#066C98', '#FF5733', '#28A745', '#FFC107', '#17A2B8', '#6F42C1', '#E83E8C'],
};

const WhyFreepare = () => {

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const cardData = [
    { 
      icon: <EmojiPeople sx={{ fontSize: 50, color: colors.icons[0], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "User Experience", 
      description: "FREEPARE is designed with a user-first approach, ensuring a seamless, intuitive, and hassle-free experience. With a clean, modern interface and smooth navigation, students can focus entirely on learning without distractions." 
    },
    { 
      icon: <Verified sx={{ fontSize: 50, color: colors.icons[1], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "Quality Assurance", 
      description: "Every test and study material on FREEPARE is meticulously curated by subject-matter experts to maintain the highest level of accuracy and reliability." 
    },
    { 
      icon: <School sx={{ fontSize: 50, color: colors.icons[2], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "Level Wise Segregation", 
      description: "FREEPARE offers questions categorized by difficulty levels. Focus on specific difficulty levels to strengthen weak areas or test your mastery of complex topics." 
    },
    { 
      icon: <MonetizationOn sx={{ fontSize: 50, color: colors.icons[3], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "No Sign-Up Fees", 
      description: "Experience pure learning with no strings attached. FREEPARE is committed to providing high-quality learning resources for free – no hidden charges, no premium subscriptions." 
    },
    { 
      icon: <Timer sx={{ fontSize: 50, color: colors.icons[4], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "High-Quality Mock Tests", 
      description: "FREEPARE’s mock tests are curated by experts to ensure high standards, accuracy, and relevance. Get the closest experience to the actual exams and assess your preparedness effectively." 
    },
    { 
      icon: <OndemandVideo sx={{ fontSize: 50, color: colors.icons[5], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "Updated Question Bank", 
      description: "Stay ahead with FREEPARE’s frequently updated question bank that reflects the latest exam trends and patterns, ensuring you are always prepared for what's next." 
    },
    { 
      icon: <Public sx={{ fontSize: 50, color: colors.icons[6], animation: `${iconAnimation} 2s infinite` }} />, 
      title: "Global Accessibility", 
      description: "Education should have no boundaries. FREEPARE is accessible worldwide, empowering students from different backgrounds and regions with high-quality learning resources." 
    },
];
  

  return (
    <Container sx={{ my: 2, py: 4 }}>
      <Typography
        variant="h2"
        align="center"
        gutterBottom
        sx={{
          fontWeight: '500',
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
          background: `linear-gradient(90deg,rgb(240, 82, 161) 30%, #FFD700 100%)`,          
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          animation: `${fadeIn} 1s ease-in-out`,
        }}
      >
        Why FREEPARE?
      </Typography>

      <Slider {...settings}>
        {cardData.map((card, index) => (
          <Box key={index} sx={{ px: 2, py: 2, animation: `${fadeIn} 1s ease-in-out` }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 3,
                bgcolor: '#fff',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: 6,
                },
                height: 'auto', // Changed height to auto
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Box sx={{ flexShrink: 0 }}>{card.icon}</Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 600,  background: `linear-gradient(90deg,rgb(240, 82, 161) 30%, #FFD700 100%)`,          
                      WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", mb: 2, textAlign: 'center', fontSize: '1.3rem' }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.text,
                      lineHeight: 1.6,
                      overflow: 'hidden', // Added ellipsis for text overflow
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
      </Slider>
    </Container>
  );
};

export default WhyFreepare;
