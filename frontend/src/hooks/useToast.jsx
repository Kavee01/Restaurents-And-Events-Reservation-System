import { notifications } from "@mantine/notifications";

function useToast() {
  const successToast = (obj) => {
    notifications.show({
      title: obj.title,
      message: obj.message,
      autoClose: 5000,
    });
  };

  const errorToast = (err) => {
    if (err) {
      // Handle different error formats
      if (typeof err === 'string') {
        notifications.show({
          title: "Error",
          message: err,
          autoClose: 5000,
          color: "red",
        });
      } else if (err.title && err.message) {
        notifications.show({
          title: err.title,
          message: err.message,
          autoClose: 5000,
          color: "red",
        });
      } else if (err.message) {
        notifications.show({
          title: "Error",
          message: err.message,
          autoClose: 5000,
          color: "red",
        });
      } else {
        // Fallback for unknown error format
        notifications.show({
          title: "Error",
          message: "An unexpected error occurred",
          autoClose: 5000,
          color: "red",
        });
      }
      return;
    }
    
    // Default error message when no error details provided
    notifications.show({
      title: "Something went wrong!",
      message: "Please try again later",
      autoClose: 5000,
      color: "red",
    });
  };

  return {
    successToast,
    errorToast,
  };
}

export default useToast;
