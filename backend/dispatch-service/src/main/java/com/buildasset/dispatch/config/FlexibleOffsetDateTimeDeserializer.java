package com.buildasset.dispatch.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class FlexibleOffsetDateTimeDeserializer extends JsonDeserializer<OffsetDateTime> {

    @Override
    public OffsetDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        text = text.trim();

        // 1. Try standard OffsetDateTime.parse (e.g. 2026-09-21T00:00:00Z or 2026-09-21T00:00:00+05:30)
        try {
            return OffsetDateTime.parse(text);
        } catch (DateTimeParseException ignored) {}

        // 2. Try LocalDate.parse (e.g. 2026-09-21)
        try {
            LocalDate localDate = LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE);
            return localDate.atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        } catch (DateTimeParseException ignored) {}

        // 3. Try LocalDateTime.parse (e.g. 2026-09-21T10:30:00)
        try {
            LocalDateTime localDateTime = LocalDateTime.parse(text, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return localDateTime.atOffset(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {}

        // 4. Try date-time with space (e.g. 2026-09-21 10:30:00)
        try {
            String isoWithT = text.replace(" ", "T");
            LocalDateTime localDateTime = LocalDateTime.parse(isoWithT, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return localDateTime.atOffset(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {}

        throw new IOException("Unable to parse date-time string: '" + text + "'. Supported formats: YYYY-MM-DD, ISO-8601 OffsetDateTime.");
    }
}
