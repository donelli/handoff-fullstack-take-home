import React, { useState, useRef, useEffect } from "react";
import { MdClose } from "react-icons/md";
import styles from "./Autocomplete.module.css";
import { Avatar } from "./Avatar";
import { Spinner } from "./Spinner";

export interface AutocompleteOption<T> {
  id: number;
  label: string;
  sublabel?: string;
  data: T;
}

interface AutocompleteProps<T> {
  options: AutocompleteOption<T>[];
  selectedOptions: AutocompleteOption<T>[];
  onChange: (selected: AutocompleteOption<T>[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
}

export function Autocomplete<T>({
  options,
  selectedOptions,
  onChange,
  placeholder = "Search...",
  disabled = false,
  label,
  loading = false,
}: AutocompleteProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptionsSet = React.useMemo(() => {
    return new Set(selectedOptions.map((option) => option.id));
  }, [selectedOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const optionsToShow = React.useMemo(() => {
    if (!isOpen) {
      return [];
    }

    if (!searchValue) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [isOpen, options, searchValue]);

  const handleOptionClick = React.useCallback(
    (option: AutocompleteOption<T>) => {
      if (disabled) return;

      if (selectedOptionsSet.has(option.id)) {
        onChange(selectedOptions.filter((o) => o.id !== option.id));
        return;
      }

      onChange([...selectedOptions, option]);
      setSearchValue("");
      inputRef.current?.focus();
    },
    [
      selectedOptions,
      selectedOptionsSet,
      onChange,
      inputRef,
      setSearchValue,
      disabled,
    ],
  );

  const onInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const text = (event.target as HTMLInputElement).value;

      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveOptionIndex(-1);
        inputRef.current?.blur();
        return;
      }

      // If there is no text and there are selected options, remove the last selected option
      if (event.key === "Backspace" && !text && selectedOptions.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        onChange(selectedOptions.slice(0, -1));
        return;
      }

      // If there is only one option, select/unselect it
      if (event.key === "Enter" && activeOptionIndex !== -1) {
        event.preventDefault();
        event.stopPropagation();
        handleOptionClick(optionsToShow[activeOptionIndex]!);
        return;
      }

      // Avoid submitting the form
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      let shouldScroll = false;

      if (event.key === "ArrowDown") {
        setActiveOptionIndex((prev) =>
          Math.min(prev + 1, optionsToShow.length - 1),
        );
        shouldScroll = true;
      }

      if (event.key === "ArrowUp") {
        setActiveOptionIndex((prev) => Math.max(prev - 1, 0));
        shouldScroll = true;
      }

      if (shouldScroll) {
        if (dropdownRef.current) {
          const approximateHeight = 45;
          const approximateScrollTop =
            activeOptionIndex * approximateHeight - approximateHeight * 3;
          dropdownRef.current.scrollTop = approximateScrollTop;
        }
      }
    },
    [
      onChange,
      selectedOptions,
      optionsToShow,
      handleOptionClick,
      activeOptionIndex,
    ],
  );

  return (
    <div className={styles.autocompleteContainerWrapper}>
      {label && <label className={styles.textBoxLabel}>{label}</label>}

      <div className={styles.autocompleteContainer} ref={containerRef}>
        {selectedOptions.map((option) => (
          <div className={styles.autocompleteOption} key={option.id}>
            {option.label}
            <button
              className={styles.autocompleteOptionRemoveButton}
              onClick={() =>
                onChange(selectedOptions.filter((o) => o.id !== option.id))
              }
            >
              <MdClose size={12} color="var(--font-color-secondary)" />
            </button>
          </div>
        ))}
        <input
          placeholder={placeholder}
          ref={inputRef}
          disabled={disabled}
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
            setActiveOptionIndex(0);
          }}
          onFocus={(event) => {
            event.stopPropagation();
            setIsOpen(true);
          }}
          onKeyDown={onInputKeyDown}
        />
        {loading && <Spinner />}
        {isOpen && (
          <div
            className={styles.autocompleteDropdown}
            ref={dropdownRef}
            onClick={(event) => event.stopPropagation()}
          >
            {optionsToShow.map((option, index) => {
              const classNames = [
                styles.autocompleteDropdownOption,
                selectedOptionsSet.has(option.id) &&
                  styles.autocompleteDropdownOptionSelected,
                activeOptionIndex === index &&
                  styles.autocompleteDropdownOptionActive,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  className={classNames}
                  key={option.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    handleOptionClick(option);
                  }}
                >
                  <Avatar size={24}>
                    <span className="primary">
                      {option.label.charAt(0).toUpperCase()}
                    </span>
                  </Avatar>
                  {option.label}
                  {option.sublabel && (
                    <span className={styles.autocompleteDropdownOptionSublabel}>
                      {option.sublabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
