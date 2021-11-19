package api.app.astrodao.com.core.utils;

import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@UtilityClass
public class Base64Utils {
    @SneakyThrows(UnsupportedEncodingException.class)
    public static String encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8.toString()));
    }

    @SneakyThrows(UnsupportedEncodingException.class)
    public static String decode(String value) {
        byte[] decodedValue = Base64.getDecoder().decode(value);
        return new String(decodedValue, StandardCharsets.UTF_8.toString());
    }
}
