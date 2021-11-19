package api.app.astrodao.com.core.utils;

import lombok.experimental.UtilityClass;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@UtilityClass
public class WaitUtils {

    public static void sleep(Duration duration) {
        try {
            Thread.sleep(duration.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e.getMessage());
        }
    }

    public static synchronized String getEpochMillis() {
        sleep(Duration.of(1L, ChronoUnit.MILLIS));
        return String.valueOf(System.currentTimeMillis());
    }

    public static synchronized String getLocalDateTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy 'at' HH:mm:ss"));
    }

}
