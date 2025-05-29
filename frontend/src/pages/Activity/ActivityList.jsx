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
  TextInput,
  Button,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertCircle, IconCalendarEvent, IconCurrencyDollar, IconMapPin, IconStar, IconUsers, IconSearch, IconX } from "@tabler/icons-react";

function ActivityList() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [addressFilter, setAddressFilter] = useState("");
  const { sendRequest } = useFetch();
  const theme = useMantineTheme();
  const isPc = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Filter data based on address input
    if (addressFilter.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(activity => 
        activity.location?.toLowerCase().includes(addressFilter.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [addressFilter, data]);

  const getList = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/activities`,
        "GET"
      );
      setData(resData);
      setFilteredData(resData);
    } catch (err) {
      console.log(err);
      setError(true);
      // Load demo data if API fails
      const demoData = [
        {
          _id: 'sample1',
          title: 'Culinary Workshop',
          location: 'Central Kitchen',
          price: 75,
          capacity: 12,
          date: [new Date('2023-06-15'), new Date('2023-06-22'), new Date('2023-06-29')],
          description: 'Learn to create amazing dishes with our expert chefs.',
        },
        {
          _id: 'sample2',
          title: 'Wine Tasting Tour',
          location: 'Vineyard Estate',
          price: 120,
          capacity: 20,
          date: [new Date('2023-06-18'), new Date('2023-07-02')],
          description: 'Sample premium wines from our collection with expert guidance.',
        },
        {
          _id: 'sample3',
          title: 'Sunset Yoga Class',
          location: 'Beachfront Deck',
          price: 35,
          capacity: 15,
          date: [new Date('2023-06-17'), new Date('2023-06-24'), new Date('2023-07-01')],
          description: 'Relaxing yoga sessions with stunning sunset views.',
        },
      ];
      setData(demoData);
      setFilteredData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (dates) => {
    if (!dates || dates.length === 0) return "No dates available";
    
    // Sort dates chronologically
    const sortedDates = [...dates].map(d => new Date(d)).sort((a, b) => a - b);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (sortedDates.length === 1) {
      return formatter.format(sortedDates[0]);
    }
    
    // If there are multiple dates, show the range
    return `${formatter.format(sortedDates[0])} - ${formatter.format(sortedDates[sortedDates.length - 1])}`;
  };

  const handleMouseEnter = (id) => {
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const clearFilter = () => {
    setAddressFilter("");
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Note" color="blue" mt="md" mb="md">
              Currently showing sample activities. Backend API endpoints will be implemented soon.
            </Alert>
          )}

          <Box mb="xl">
            <TextInput
              placeholder="Filter by location"
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              rightSection={
                addressFilter ? (
                  <IconX 
                    size={18} 
                    style={{ cursor: 'pointer' }} 
                    onClick={clearFilter}
                  />
                ) : (
                  <IconSearch size={18} />
                )
              }
              styles={{
                root: {
                  maxWidth: '500px',
                },
                input: {
                  borderColor: addressFilter ? '#d1ae36' : undefined,
                  '&:focus': {
                    borderColor: '#d1ae36',
                  },
                },
              }}
            />
            {addressFilter && (
              <Text size="sm" mt="xs" c="dimmed">
                Showing {filteredData.length} of {data.length} activities
              </Text>
            )}
          </Box>

          <Flex
            gap="xl"
            justify="flex-start"
            align="stretch"
            wrap="wrap"
            mt="xl"
          >
            {filteredData.length > 0 ? (
              filteredData.map((activity) => (
              <Anchor
                key={activity._id}
                component={Link}
                to={`/activities/${activity._id}`}
                underline="none"
                display="block"
                w={
                  isPc
                    ? `calc(33.3333% - var(--mantine-spacing-xl) * 2 / 3`
                    : `100%`
                }
                  onMouseEnter={() => handleMouseEnter(activity._id)}
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
                      transform: hoveredItem === activity._id ? 'translateY(-5px)' : 'none',
                      boxShadow: hoveredItem === activity._id 
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
                        {activity.date ? `${activity.date.length} dates` : "No dates"}
                      </Badge>
                      
                      <Title order={3} mb="md" lineClamp={1} style={{ color: '#2C3E50', fontSize: '1.3rem', paddingRight: '85px' }}>
                    {activity.title}
                  </Title>
                    </Box>

                    <Group gap="xs" mb="xs">
                      <Flex align="center" gap="5px">
                        <IconCalendarEvent size={16} color="#d1ae36" stroke={1.5} />
                        <Text size="sm" c="dimmed">{formatDateRange(activity.date)}</Text>
                      </Flex>
                    </Group>
                    
                    <Group gap="xs" mb="xs">
                      <Flex align="center" gap="5px">
                        <IconMapPin size={16} color="#d1ae36" stroke={1.5} />
                        <Text size="sm" c="dimmed">
                        {activity.location}
                      </Text>
                    </Flex>
                    </Group>

                    <Group gap="xs" mb="xs">
                      <Flex align="center" gap="5px">
                        <IconCurrencyDollar size={16} color="#d1ae36" stroke={1.5} />
                        <Text size="sm" c="dimmed">
                        ${activity.price} per person
                      </Text>
                    </Flex>
                    </Group>

                    <Group gap="xs" mb="xs">
                      <Flex align="center" gap="5px">
                        <IconUsers size={16} color="#d1ae36" stroke={1.5} />
                        <Text size="sm" c="dimmed">
                        Max {activity.capacity} people
                      </Text>
                    </Flex>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={2} mb="xs" mt="xs" style={{ flex: 1 }}>
                      {activity.description}
                    </Text>

                    <Transition mounted={hoveredItem === activity._id} transition="fade" duration={400}>
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
              ))
            ) : (
              <Box py="xl" w="100%" ta="center">
                <Text c="dimmed">No activities found matching "{addressFilter}"</Text>
                <Button 
                  variant="subtle" 
                  color="yellow" 
                  onClick={clearFilter} 
                  mt="md"
                  leftSection={<IconX size={14} />}
                >
                  Clear filter
                </Button>
              </Box>
            )}
          </Flex>
        </>
      )}
    </>
  );
}

export default ActivityList; 