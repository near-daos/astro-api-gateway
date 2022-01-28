package api.app.astrodao.com.core.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.TreeCodec;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.gson.JsonParser;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.PropertyAccessor.FIELD;

@UtilityClass
public class JsonUtils {
    public static final ObjectMapper MAPPER;

    static {
        MAPPER = new ObjectMapper();
        MAPPER.findAndRegisterModules();
        MAPPER.setVisibility(FIELD, ANY);
        MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        MAPPER.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @SneakyThrows(JsonProcessingException.class)
    public static <T> T readValue(String content, Class<T> valueType) {
        String canonicalFormat = JsonParser.parseString(content).toString();
        return MAPPER.readValue(canonicalFormat, valueType);
    }

    @SneakyThrows(JsonProcessingException.class)
    public static String writeValueAsString(Object valueType) {
        return MAPPER.writeValueAsString(valueType);
    }

    @SneakyThrows(JsonProcessingException.class)
    public static <T> T treeToValue(TreeNode treeNode, Class<T> valueType) {
        return MAPPER.treeToValue(treeNode, valueType);
    }

    public static JsonNode valueToTree(Object map) {
        return MAPPER.valueToTree(map);
    }

    @SneakyThrows(JsonProcessingException.class)
    public static <T> T valueToObject(Object map, Class<T> valueType) {
        JsonNode jsonNode = MAPPER.valueToTree(map);
        return MAPPER.treeToValue(jsonNode, valueType);
    }
}
