"use client";
import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon } from "lucide-react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import OGPill from "../OGPill";
import { OGCheckbox } from "../OGCheckbox";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { useFetchCategories } from "@/hooks/appHooks";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { Divider } from "@/components/ui/divider";
import { OGButton } from "../OGButton";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";

type Props = {};

const RightIconCategoryAccordion = forwardRef(
  (
    props: {
      defaultExpanded: boolean;
      onPress: () => void;
    },
    ref,
  ) => {
    const { defaultExpanded, onPress } = props;
    const [Expanded, setExpanded] = useState(defaultExpanded);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      toggleExpanded: () => setExpanded((prev) => !prev),
      setExpandedState: (state: boolean) => setExpanded(state),
    }));

    return (
      <Pressable
        onPress={() => {
          setExpanded(!Expanded);
          onPress();
        }}
      >
        {!Expanded ? (
          <Icon as={ChevronDownIcon} className="ml-2" />
        ) : (
          // <Icon as={MinusIcon} className="ml-2" />
          <Icon as={ChevronUpIcon} className="ml-2" />
          // <Icon as={PlusIcon} className="ml-2" />
        )}
      </Pressable>
    );
  },
);

interface CategoryLBlockInterFace {
  //   children?: React.ReactNode;
  expand?: boolean;
  indx: number;
  value?: string;
  //   title: string;
  data: any;
  onChange?: (prop: any, value: any) => void;
  selected: any;
  defaultIsChecked?: boolean;
  partialChecked?: boolean;
  fullChecked?: boolean;
  level: number;
}
const CategoryLBlock = ({
  data,
  indx,
  expand = false,
  onChange = undefined,
  selected = [],
  defaultIsChecked = false,
  partialChecked = false,
  fullChecked = false,
  level = 2,
}: CategoryLBlockInterFace) => {
  const [Expanded, setExpanded] = useState(false);
  const [HidePartial, setHidePartial] = useState(true);
  const fetchResult = useFetchCategories(data.id);
  const RightIconRef = useRef<any>(null);

  const { ifPartialSelected, inFilteredList, SelectedCategories } = useCategorySearchStore();
  let subCategories: any[] = [];
  let isSuccess = false;
  let ifLastLevel = false;

  subCategories = fetchResult?.data || []; //data.children;

  if (data.children) {
    subCategories = data.children || [];
    isSuccess = true;
  } else {
    // For L1 categories
    if (data.id.length < 6) {
      isSuccess = true;
      ifLastLevel = true;
      //@ts-ignore
      if (subCategories.length === 1 && subCategories?.children?.length !== 0) {
        subCategories = subCategories[0].children;
      }
    } else {
      // For L3 categories
      subCategories = [];
      isSuccess = true;
      ifLastLevel = true;
    }
  }

  const handleChange = (prop: any, value: any) => {
    if (onChange) {
      onChange(prop, value);
    }
  };

  useEffect(() => {
    const x = ifPartialSelected(data.id);
    if (x) {
      // Don't auto-expand when partially selected
      if (RightIconRef.current) {
        RightIconRef.current.setExpandedState(false);
        setExpanded(false);
        setHidePartial(true);
      }
    } else {
      if (RightIconRef.current) {
        RightIconRef.current.setExpandedState(false);
        setExpanded(false);
        setHidePartial(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SelectedCategories]);

  // Replace both useEffect hooks with this single one
  useEffect(() => {
    // Ensure both local state and ref state are collapsed
    setExpanded(false);
    setHidePartial(true);
    if (RightIconRef.current) {
      RightIconRef.current.setExpandedState(false);
    }
  }, [SelectedCategories, data.id]);
  // debugger;
  return (
    <Box className="my-1 flex" key={indx}>
      <Box className="flex w-full flex-row items-center">
        <Box
          className="flex-1 cursor-pointer overflow-hidden text-ellipsis"
          //@ts-ignore
          title={getTitleOfCategory(data)}
        >
          {(partialChecked || Expanded || true) && (
            <OGCheckbox
              className=""
              label={getTitleOfCategory(data)} // + " - "+ Expanded}
              value={data}
              defaultIsChecked={defaultIsChecked}
              onChange={handleChange}
              partial={partialChecked}
              selected={inFilteredList(data.parentId) || fullChecked}
              disabled={
                inFilteredList(data.parentId) ||
                (level !== 1 ? inFilteredList(data.id.slice(0, 3)) : false)
              }
            />
          )}
          {/* {level} */}
        </Box>
        <Box>
          {subCategories.length > 0 && (
            <RightIconCategoryAccordion
              ref={RightIconRef}
              defaultExpanded={fullChecked}
              onPress={() => {
                setExpanded(!Expanded);
                setHidePartial(!HidePartial);
              }}
            />
          )}
        </Box>
      </Box>
      {isSuccess && subCategories.length > 0 && (
        <Box className="h-full w-full pl-[16px]">
          {subCategories?.map((sCategory, indx) => {
            if (HidePartial && !Expanded && !inFilteredList(sCategory.id) && level > 1) {
              return <></>;
            }
            if (!Expanded && !ifPartialSelected(sCategory.id) && level === 1) {
              return <></>;
            }
            const containerClass = `flex ${level === 1 ? (Expanded ? "mt-2" : "") : ""}`;
            return (
              //   <></>
              <Box key={sCategory.id} className={containerClass}>
                <CategoryLBlock
                  key={indx}
                  selected={selected}
                  onChange={handleChange}
                  data={sCategory}
                  indx={indx}
                  partialChecked={ifPartialSelected(sCategory.id)}
                  fullChecked={
                    !ifLastLevel ? ifPartialSelected(sCategory.id) : inFilteredList(sCategory.id)
                  }
                  level={level + 1}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

const OGCategoriesSearcBlockOld = (props: Props) => {
  const { L1Categories, L2Categories, L3Categories } = useAdvancedSearchStore();
  const { updateFilters } = useUrlParams();
  const { searchData } = useSearchModalStore();
  const isInitialMount = useRef(true);
  const {
    SelectedCategories,
    appendToSelectedCategories,
    inSelectedCategories,
    inFilteredList,
    ifPartialSelected,
  } = useCategorySearchStore();

  useEffect(() => {
    // Skip automatic URL update during initial mount to allow URL prefilling to work
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const categoriesIdList = SelectedCategories?.map((node) => node?.id);

    updateFilters(
      {
        categoryId: pickPrimaryCategoryId(categoriesIdList ?? []),
        year: searchData?.year?.value || null,
      },
      "/products",
      // "",
      // true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SelectedCategories]);

  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="single"
      isCollapsible={true}
      isDisabled={false}
      className="w-full"
      defaultValue={"a" as any}
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger className="px-0 py-3">
            {({ isExpanded }) => {
              return (
                <>
                  <AccordionTitleText className="text-start">Categories</AccordionTitleText>
                  {isExpanded ? (
                    <AccordionIcon as={ChevronUpIcon} className="" />
                  ) : (
                    <AccordionIcon as={ChevronDownIcon} className="" />
                  )}
                </>
              );
            }}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className="mt-0 px-0">
          <Divider />
          <Box className="mt-4 w-full gap-2">
            <Box className="flex">
              {L1Categories?.map((category, indx) => {
                return (
                  <>
                    <CategoryLBlock
                      key={indx}
                      expand={false}
                      data={category}
                      indx={indx}
                      selected={SelectedCategories}
                      onChange={(state, value) => {
                        appendToSelectedCategories(value);
                        return;
                      }}
                      fullChecked={inFilteredList(category.id)}
                      partialChecked={ifPartialSelected(category.id)}
                      level={1}
                    />
                  </>
                );
              })}
            </Box>
          </Box>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OGCategoriesSearcBlockOld;
