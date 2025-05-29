import { Button, Group, Modal as ModalMantine, Text } from "@mantine/core";
import PropTypes from "prop-types";
import { useState } from "react";

function Modal({ opened, close, modalContent, toggle, onSubmit, title, confirmText = "Proceed", cancelText = "Back" }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (onSubmit) {
      setSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <ModalMantine 
      opened={opened} 
      onClose={close} 
      title={title}
      withCloseButton
      closeOnClickOutside={!submitting}
      trapFocus
      returnFocus
    >
      {modalContent}
      <Text mt="md">Are you sure you want to proceed?</Text>
      <Group justify="center" mt="xl">
        <Button 
          type="button" 
          variant="outline" 
          onClick={close}
          disabled={submitting}
        >
          {cancelText}
        </Button>
        {onSubmit && (
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={submitting}
          >
            {confirmText}
          </Button>
        )}
      </Group>
    </ModalMantine>
  );
}

export default Modal;

Modal.propTypes = {
  opened: PropTypes.bool,
  close: PropTypes.func,
  modalContent: PropTypes.node,
  toggle: PropTypes.func,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};
