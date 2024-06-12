import React, { useState } from "react";
import { Container, VStack, Input, Button, Text, Box, Spinner, HStack, IconButton } from "@chakra-ui/react";
import { FaSearch, FaPlus } from "react-icons/fa";
import axios from "axios";

const Index = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Fetch data from Zotero
      const zoteroResponse = await axios.get(`https://api.zotero.org/users/YOUR_USER_ID/items`, {
        params: {
          q: query,
          format: "json",
          key: "YOUR_ZOTERO_API_KEY",
        },
      });

      const zoteroData = zoteroResponse.data;

      // Augment data with Semantic Scholar
      const augmentedResults = await Promise.all(
        zoteroData.map(async (item) => {
          const semanticResponse = await axios.get(`https://api.semanticscholar.org/v1/paper/${item.data.DOI}`);
          return {
            ...item.data,
            semanticData: semanticResponse.data,
          };
        }),
      );

      setResults(augmentedResults);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4} width="100%">
        <HStack width="100%">
          <Input placeholder="Search for articles..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <IconButton aria-label="Search" icon={<FaSearch />} onClick={handleSearch} />
        </HStack>
        {loading ? (
          <Spinner size="xl" />
        ) : (
          results.map((result) => (
            <Box key={result.key} p={4} borderWidth="1px" borderRadius="lg" width="100%">
              <Text fontSize="xl">{result.title}</Text>
              <Text>{result.creators.map((creator) => creator.lastName).join(", ")}</Text>
              <Text>{result.date}</Text>
              <Button leftIcon={<FaPlus />} colorScheme="teal" variant="outline" mt={2}>
                Augment Metadata
              </Button>
              {result.semanticData && (
                <Box mt={2}>
                  <Text fontSize="md">Semantic Scholar Data:</Text>
                  <Text>Citations: {result.semanticData.citationCount}</Text>
                  <Text>Influential Citations: {result.semanticData.influentialCitationCount}</Text>
                </Box>
              )}
            </Box>
          ))
        )}
      </VStack>
    </Container>
  );
};

export default Index;
