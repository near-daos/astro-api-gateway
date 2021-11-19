package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.utils.JsonUtils;
import io.qameta.allure.Step;
import org.assertj.core.api.AssertionsForInterfaceTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

public abstract class BaseSteps {
    @Step("Verify http status code is correct")
    public void assertResponseStatusCode(ResponseEntity<?> actual, HttpStatus status) {
        assertThat(actual.getStatusCode())
                .as("http status code should be correct.")
                .isEqualTo(status);
    }

    @Step("Verify response collection is not empty")
    public void assertCollectionResponseIsNotEmpty(Collection<?> actual) {
        assertThat(actual)
                .as("Response collection should not be empty.")
                .asList().isNotEmpty();
    }

    @Step("User sees collection has correct size")
    public void assertCollectionHasCorrectSize(Collection<?> actual, int expectedSize) {
        assertThat(actual.size())
                .as("Collection should have correct size.")
                .isEqualTo(expectedSize);
    }

    @Step("User sees collection are the same (regardless of order)")
    public void assertCollectionsAreEqual(List<String> actual, List<String> expected) {
        AssertionsForInterfaceTypes.assertThat(actual)
                .as("Collection should have the same elements.")
                .containsExactlyInAnyOrder(expected.toArray(String[]::new));
    }

    @Step("User sees valid '{fieldName}' contains '{expectedValue}' value")
    public <T> void assertDtoContainsValue(T dto, Function<T, String> valueExtractor,
                                           String expectedValue, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field must contain value.", fieldName))
                .containsIgnoringCase(expectedValue);
    }

    @Step("User sees '{fieldName}' field has '{expectedValue}' value")
    public <T, D> void assertDtoValue(T dto, Function<T, D> valueExtractor,
                                           D expectedValue, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field must contain value.", fieldName))
                .isEqualTo(expectedValue);
    }

    @Step("User sees '{fieldName}' field has no value")
    public <T, D> void assertDtoValueIsNull(T dto, Function<T, D> valueExtractor, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field should have no value.", fieldName))
                .isNull();
    }

    public <T> T getResponseDto(ResponseEntity<String> entity, Class<T> clazz) {
        return JsonUtils.readValue(entity.getBody(), clazz);
    }
}
