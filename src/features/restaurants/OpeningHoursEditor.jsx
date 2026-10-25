import styled from "styled-components";
import { HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

import Button from "@/ui/Button";
import ButtonIcon from "@/ui/ButtonIcon";
import Input from "@/ui/Input";
import SelectHtml from "@/ui/SelectHtml";
import { DAYS } from "./restaurantConstants";

const Week = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const DayRow = styled.div`
  display: grid;
  grid-template-columns: 10rem 1fr auto;
  align-items: start;
  gap: 1.2rem;
`;

const DayLabel = styled.span`
  font-weight: 500;
  padding-top: 0.8rem;
`;

const Slots = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem 1.6rem;
`;

const Slot = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  & input {
    width: 11rem;
  }
`;

const Closed = styled.span`
  color: var(--color-grey-500);
`;

const DayActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

// In entry order within a day, so a slot doesn't move while being typed in
const daySlots = (slots, day) => slots.filter((s) => s.day === day);

const hoursText = (slots) =>
  [...slots]
    .sort((a, b) => a.open.localeCompare(b.open))
    .map((s) => `${s.open}–${s.close}`)
    .join(", ");

/**
 * Week schedule editor: a day without slot is closed. Each day can take the
 * hours of any other day, listed by their hours rather than the day.
 *
 * @param {Array} value: slots {day, open, close}, 0 = monday
 * @param {Function} onChange: (slots) => void
 * */
function OpeningHoursEditor({ value, onChange, disabled }) {
  const slots = value || [];

  function setDay(day, newDaySlots) {
    onChange(
      [
        ...slots.filter((s) => s.day !== day),
        ...newDaySlots.map((s) => ({ ...s, day })),
      ].sort((a, b) => a.day - b.day),
    );
  }

  function addSlot(day) {
    const current = daySlots(slots, day);
    const slot = current.length
      ? { open: "19:00", close: "22:00" }
      : { open: "12:00", close: "14:00" };
    setDay(day, [...current, slot]);
  }

  function updateSlot(day, index, field, time) {
    setDay(
      day,
      daySlots(slots, day).map((s, i) =>
        i === index ? { ...s, [field]: time } : s,
      ),
    );
  }

  function removeSlot(day, index) {
    setDay(
      day,
      daySlots(slots, day).filter((_, i) => i !== index),
    );
  }

  return (
    <Week>
      {DAYS.map((dayName, day) => {
        const current = daySlots(slots, day);
        // The other days' schedules, each listed once
        const copyOptions = [
          ...new Set(
            DAYS.map((_, other) => other)
              .filter((other) => other !== day)
              .map((other) => hoursText(daySlots(slots, other)))
              .filter((text) => text && text !== hoursText(current)),
          ),
        ];

        return (
          <DayRow key={dayName}>
            <DayLabel>{dayName}</DayLabel>

            <Slots>
              {current.length === 0 && <Closed>Fermé</Closed>}
              {current.map((slot, index) => (
                <Slot key={index}>
                  <Input
                    type="time"
                    aria-label={`${dayName} ouverture`}
                    value={slot.open}
                    onChange={(e) =>
                      updateSlot(day, index, "open", e.target.value)
                    }
                    disabled={disabled}
                  />
                  –
                  <Input
                    type="time"
                    aria-label={`${dayName} fermeture`}
                    value={slot.close}
                    onChange={(e) =>
                      updateSlot(day, index, "close", e.target.value)
                    }
                    disabled={disabled}
                  />
                  <ButtonIcon
                    type="button"
                    title="Retirer ce créneau"
                    onClick={() => removeSlot(day, index)}
                    disabled={disabled}
                  >
                    <HiOutlineXMark />
                  </ButtonIcon>
                </Slot>
              ))}
            </Slots>

            <DayActions>
              {copyOptions.length > 0 && (
                <SelectHtml
                  aria-label={`Copier des horaires sur ${dayName}`}
                  value=""
                  onChange={(e) => {
                    const source = DAYS.map((_, other) => other).find(
                      (other) =>
                        hoursText(daySlots(slots, other)) === e.target.value,
                    );
                    setDay(day, daySlots(slots, source));
                  }}
                  disabled={disabled}
                  options={[
                    { value: "", label: "Copier…" },
                    ...copyOptions.map((text) => ({
                      value: text,
                      label: text,
                    })),
                  ]}
                />
              )}
              <Button
                type="button"
                $variation="secondary"
                $size="small"
                onClick={() => addSlot(day)}
                disabled={disabled}
              >
                <HiOutlinePlus /> Créneau
              </Button>
            </DayActions>
          </DayRow>
        );
      })}
    </Week>
  );
}

export default OpeningHoursEditor;
