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
  Transition,
  TextInput,
  Button,
  Select,
  SimpleGrid,
  Image,
  Container,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/Parts/LoadingSpinner";
import { useMediaQuery } from "@mantine/hooks";
import classes from "./RestaurantList.module.css";
import { IconClock, IconMapPin, IconToolsKitchen3, IconStar, IconSearch, IconX, IconFilter } from "@tabler/icons-react";
import useCheckBooking from "../../hooks/useCheckBooking";

function RestaurantList() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const { sendRequest } = useFetch();
  const theme = useMantineTheme();
  const isPc = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const { formatTime } = useCheckBooking();

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Filter data based on location and category input
    let filtered = [...data];
    
    if (locationFilter.trim() !== '') {
      filtered = filtered.filter(restaurant => 
        restaurant.address?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        restaurant.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(restaurant => 
        restaurant.category === categoryFilter
      );
    }
    
    setFilteredData(filtered);
  }, [locationFilter, categoryFilter, data]);

  // Extract unique categories from data
  useEffect(() => {
    if (data.length > 0) {
      const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
      setCategories(uniqueCategories.map(category => ({ value: category, label: category })));
    }
  }, [data]);

  const getList = async () => {
    try {
      const resData = await sendRequest(
        `${import.meta.env.VITE_API_URL}/restaurant`,
        "GET"
      );
      const formattedData = resData.restaurants.map((restaurant) => {
        const timeOpen = restaurant.timeOpen
          ? formatTime(restaurant.timeOpen)
          : null;
        const timeClose = restaurant.timeClose
          ? formatTime(restaurant.timeClose)
          : null;
        // Get the preview image URL
        const previewImage = restaurant.images && restaurant.images.length > 0
          ? restaurant.images[restaurant.previewImageIndex || 0]
          : null;
        return { ...restaurant, timeOpen, timeClose, previewImage };
      });
      setData(formattedData);
      setFilteredData(formattedData);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleMouseEnter = (id) => {
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const clearFilters = () => {
    setLocationFilter("");
    setCategoryFilter("");
  };

  const isFiltered = locationFilter || categoryFilter;

  return (
    <>
      <Box mb="xl">
        <Text weight={500} size="lg" mb="md" c="white">Filter Restaurants</Text>
        <SimpleGrid cols={isPc ? 2 : 1} spacing="md" mb="md">
          <TextInput
            placeholder="Filter by location or address"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            rightSection={
              locationFilter ? (
                <IconX 
                  size={18} 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => setLocationFilter("")}
                />
              ) : (
                <IconMapPin size={18} />
              )
            }
            styles={{
              input: {
                borderColor: locationFilter ? '#d1ae36' : undefined,
                '&:focus': {
                  borderColor: '#d1ae36',
                },
              },
              label: {
                color: 'white',
              },
            }}
            label="Location"
          />
          
          <Select
            placeholder="Select category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            data={categories}
            clearable
            searchable
            rightSection={
              categoryFilter ? (
                <IconX 
                  size={18} 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => setCategoryFilter("")}
                />
              ) : (
                <IconFilter size={18} />
              )
            }
            styles={{
              input: {
                borderColor: categoryFilter ? '#d1ae36' : undefined,
                '&:focus': {
                  borderColor: '#d1ae36',
                },
              },
              label: {
                color: 'white',
              },
            }}
            label="Category"
          />
        </SimpleGrid>
        
        {isFiltered && (
          <Flex justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Showing {filteredData.length} of {data.length} restaurants
            </Text>
            <Button 
              variant="subtle" 
              color="yellow" 
              onClick={clearFilters} 
              leftSection={<IconX size={14} />}
              size="xs"
            >
              Clear filters
            </Button>
          </Flex>
        )}
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Flex
          gap="xl"
          justify="flex-start"
          align="stretch"
          wrap="wrap"
          mt="xl"
        >
          {filteredData.length > 0 ? (
            filteredData.map((restaurant) => (
              <Anchor
                key={restaurant._id}
                component={Link}
                to={`/restaurant/${restaurant._id}`}
                underline="none"
                display="block"
                w={
                  isPc
                    ? `calc(33.3333% - var(--mantine-spacing-xl) * 2 / 3`
                    : `100%`
                }
                onMouseEnter={() => handleMouseEnter(restaurant._id)}
                onMouseLeave={handleMouseLeave}
                style={{ marginBottom: '20px' }}
              >
                <Paper
                  shadow="md"
                  radius="md"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: hoveredItem === restaurant._id ? 'translateY(-5px)' : 'none',
                    boxShadow: hoveredItem === restaurant._id 
                      ? '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 15px rgba(209, 174, 54, 0.3)' 
                      : '0 8px 20px rgba(0, 0, 0, 0.15)',
                    borderRadius: '16px',
                    border: hoveredItem === restaurant._id 
                      ? '1px solid rgba(209, 174, 54, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    backgroundColor: 'rgba(26, 27, 30, 0.95)',
                  }}
                >
                  {/* Image Container */}
                  <Box 
                    style={{ 
                      height: '240px',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={`${import.meta.env.VITE_API_URL}${restaurant.previewImage}`}
                      alt={restaurant.name}
                      height={240}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        transition: 'transform 0.3s ease',
                        transform: hoveredItem === restaurant._id ? 'scale(1.05)' : 'scale(1)',
                      }}
                      fallbackSrc="/restaurant-placeholder.jpg"
                    />
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                        height: '150px',
                        pointerEvents: 'none',
                      }}
                    />
                  </Box>

                  {/* Content Container */}
                  <Box p="xl" style={{ flex: 1 }}>
                    <Box style={{ position: 'relative', marginTop: '-20px' }}>
                      <Badge 
                        color="gold" 
                        variant="light" 
                        style={{
                          position: 'absolute',
                          top: '-230px',
                          right: '-8px',
                          backgroundColor: 'rgba(209, 174, 54, 0.95)',
                          color: '#fff',
                          fontWeight: 600,
                          backdropFilter: 'blur(5px)',
                          zIndex: 2,
                          padding: '8px 12px',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {restaurant.category}
                      </Badge>
                      
                      <Title 
                        order={3} 
                        mb="md" 
                        style={{ 
                          color: '#fff',
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          letterSpacing: '0.3px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          marginBottom: '20px',
                        }}
                      >
                        {restaurant.name}
                      </Title>
                    </Box>

                    <Group gap="lg" mb="md">
                      <Flex align="center" gap="8px">
                        <IconMapPin size={18} color="#d1ae36" stroke={1.5} />
                        <Text size="sm" c="dimmed" style={{ fontSize: '0.95rem', color: '#e0e0e0' }}>
                          {restaurant.location}
                        </Text>
                      </Flex>

                      <Flex align="center" gap="8px">
                        <IconClock size={18} color="#d1ae36" stroke={1.5} />
                        <Text size="sm" style={{ fontSize: '0.95rem', color: '#e0e0e0' }}>
                          {restaurant.timeOpen} - {restaurant.timeClose}
                        </Text>
                      </Flex>
                    </Group>

                    <Text 
                      size="sm" 
                      c="dimmed" 
                      lineClamp={2} 
                      mb="md" 
                      style={{ 
                        flex: 1,
                        color: '#a0a0a0',
                        lineHeight: 1.6,
                        fontSize: '0.9rem'
                      }}
                    >
                      {restaurant.address}
                    </Text>

                    <Transition mounted={hoveredItem === restaurant._id} transition="slide-up" duration={300}>
                      {(styles) => (
                        <Flex 
                          mt="auto" 
                          align="center" 
                          justify="flex-end"
                          style={{ ...styles }}
                        >
                          <Badge 
                            variant="filled" 
                            size="lg"
                            rightSection={<IconStar size={14} />}
                            style={{ 
                              backgroundColor: 'rgba(209, 174, 54, 0.15)',
                              color: '#d1ae36',
                              border: '1px solid rgba(209, 174, 54, 0.3)',
                              padding: '10px 16px',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(209, 174, 54, 0.25)',
                              }
                            }}
                          >
                            View Details
                          </Badge>
                        </Flex>
                      )}
                    </Transition>
                  </Box>
                </Paper>
              </Anchor>
            ))
          ) : (
            <Box py="xl" w="100%" ta="center">
              <Text c="dimmed">No restaurants found matching your filters</Text>
              <Button 
                variant="subtle" 
                color="yellow" 
                onClick={clearFilters} 
                mt="md"
                leftSection={<IconX size={14} />}
              >
                Clear filters
              </Button>
            </Box>
          )}
        </Flex>
      )}
    </>
  );
}

export default RestaurantList;
