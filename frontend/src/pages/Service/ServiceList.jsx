import {
  Flex,
  Title,
  Anchor,
  Box,
  Text,
  useMantineTheme,
  Paper,
  Badge,
  Group,
  Alert,
  Transition,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertCircle, IconClock, IconCurrencyDollar, IconStar } from "@tabler/icons-react";

function ServiceList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { sendRequest } = useFetch();
  const theme = useMantineTheme();
  const isPc = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getList = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/services`,
        "GET"
      );
      setData(resData);
    } catch (err) {
      console.log(err);
      setError(true);
      // Load demo data if API fails
      setData([
        {
          _id: 'sample1',
          title: 'Personal Chef Service',
          price: 85,
          category: 'Culinary',
          description: 'Enjoy a personalized dining experience with your own chef who will prepare a custom menu in your home.',
        },
        {
          _id: 'sample2',
          title: 'Event Photography',
          price: 120,
          category: 'Photography',
          description: 'Professional photography service for special events, parties, and gatherings.',
        },
        {
          _id: 'sample3',
          title: 'Massage Therapy',
          price: 75,
          category: 'Wellness',
          description: 'Relaxing massage therapy sessions to help you unwind and relieve stress.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (id) => {
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Note" color="blue" mt="md" mb="md">
              Currently showing sample services. Backend API endpoints will be implemented soon.
            </Alert>
          )}

          <Flex
            gap="xl"
            justify="flex-start"
            align="stretch"
            wrap="wrap"
            mt="xl"
          >
            {data.map((service) => (
              <Anchor
                key={service._id}
                component={Link}
                to={`/services/${service._id}`}
                underline="none"
                display="block"
                w={
                  isPc
                    ? `calc(33.3333% - var(--mantine-spacing-xl) * 2 / 3`
                    : `100%`
                }
                onMouseEnter={() => handleMouseEnter(service._id)}
                onMouseLeave={handleMouseLeave}
                style={{ marginBottom: '20px' }}
              >
                <Paper
                  shadow="md"
                  radius="md"
                  p="md"
                      style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: hoveredItem === service._id ? 'translateY(-5px)' : 'none',
                    boxShadow: hoveredItem === service._id 
                      ? '0 15px 30px rgba(0, 0, 0, 0.15), 0 0 10px rgba(209, 174, 54, 0.2)' 
                      : '0 5px 15px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    backgroundImage: 'linear-gradient(135deg, rgba(40, 50, 70, 0.05) 0%, rgba(30, 40, 60, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box style={{ position: 'relative' }}>
                    <Badge 
                      color="gold" 
                      variant="light" 
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: 'rgba(209, 174, 54, 0.9)',
                        color: '#fff',
                        fontWeight: 600,
                        backdropFilter: 'blur(5px)',
                      }}
                    >
                      {service.category}
                    </Badge>

                    <Title order={3} mb="md" lineClamp={1} style={{ color: '#2C3E50', fontSize: '1.3rem', paddingRight: '85px' }}>
                      {service.title}
                    </Title>
                  </Box>

                  <Group gap="xs" mb="xs">
                    <Flex align="center" gap="5px">
                      <IconCurrencyDollar size={16} color="#d1ae36" stroke={1.5} />
                      <Text size="sm" c="dimmed">${service.price} per hour</Text>
                    </Flex>
                  </Group>

                  <Group gap="xs" mb="xs">
                    <Flex align="center" gap="5px">
                      <IconClock size={16} color="#d1ae36" stroke={1.5} />
                      <Text size="sm" c="dimmed">
                        Duration: 1-4 hours
                      </Text>
                    </Flex>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={2} mb="xs" mt="xs" style={{ flex: 1 }}>
                    {service.description}
                        </Text>

                  <Transition mounted={hoveredItem === service._id} transition="fade" duration={400}>
                    {(styles) => (
                      <Flex 
                        mt="auto" 
                        align="center" 
                        justify="flex-end"
                        style={{ ...styles }}
                      >
                        <Badge 
                          variant="filled" 
                          color="#113"
                          rightSection={<IconStar size={12} />}
                          style={{ 
                            backgroundColor: 'rgba(33, 43, 54, 0.8)',
                            color: '#d1ae36',
                            border: '1px solid rgba(209, 174, 54, 0.3)'
                          }}
                        >
                          View Details
                        </Badge>
                      </Flex>
                    )}
                  </Transition>
                </Paper>
              </Anchor>
            ))}
          </Flex>
        </>
      )}
    </>
  );
}

export default ServiceList; 