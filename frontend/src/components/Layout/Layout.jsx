import { Outlet } from "react-router-dom";
import { Flex } from "@mantine/core"; // Removed Container import
import { useState } from "react";
import { getUser } from "../../service/users";

export const Layout = () => {
  const [user, setUser] = useState(getUser());
  
  return (
    <Flex
      direction="column"
      position="relative"
      style={{ 
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <main style={{ 
        flexGrow: 1,
        padding: "0px 0", // Only vertical padding, no horizontal padding
        width: "100%"      // Ensure main content takes full width
      }}>
        {/* Removed the Container component that was creating margins */}
        <Outlet context={{ user, setUser }} />
      </main>
    </Flex>
  );
};