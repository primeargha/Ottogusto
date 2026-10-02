import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { CloseIcon, Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import React, { useRef, useState } from "react";
import { OGRadioGroup, OGRadioInput } from "../OGRadioInput";
import VinSelector from "./VinSelector";
import ManualSelector from "./ManualSelector";

type Props = {
  isOpen: boolean;
  title: string;
  closeHandler?: (val: any) => void;
  type: "manually" | "vin" | "oeRef" | "confirmation";
  footer: React.ReactNode;
};

const OGSearchFlowModal = (props: Props) => {
  const { isOpen, title, type, closeHandler, footer } = props;
  const contentRef = useRef();

  const [DefaultModalType, setDefaultModalType] = useState(type);
  const [IsOpen, setIsOpen] = useState(isOpen);
  const handleClose = () => {
    setIsOpen(false);
    if (closeHandler) {
      closeHandler("closed");
    }
  };
  return (
    <Modal isOpen={IsOpen} onClose={handleClose} size="md" initialFocusRef={contentRef}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{title}</Heading>
          <ModalCloseButton>
            X{/* <CloseIcon /> */}
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Box ref={contentRef as any}>
            <OGRadioGroup
              key={"country-selector"}
              value={DefaultModalType}
              onChange={(val) => {
                setDefaultModalType(val);
              }}
              onBlur={() => {}}
              isReadOnly={false}
              className="flex min-h-8 flex-grow flex-row flex-wrap py-4"
            >
              {["manually", "vin", "oeRef", "confirmation"]?.map((typeName) => (
                <OGRadioInput
                  key={`country-${typeName}`}
                  value={typeName}
                  label={typeName.toUpperCase()}
                  // isInvalid={!!errors.country}
                  state={false ? "disabled" : "default"}
                />
              ))}
            </OGRadioGroup>
          </Box>

          <Box>
            {DefaultModalType === "vin" && (
              <VinSelector
                onVinChange={(v) => {
                  // debugger;
                }}
              />
            )}

            {DefaultModalType === "manually" && (
              <ManualSelector
                onMakeSelection={(v) => {
                  // debugger;
                }}
                onModelSelection={(v) => {
                  // debugger;
                }}
                onEngineSelection={(v) => {
                  // debugger;
                }}
              />
            )}
          </Box>
        </ModalBody>
        <ModalFooter>{footer}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OGSearchFlowModal;
