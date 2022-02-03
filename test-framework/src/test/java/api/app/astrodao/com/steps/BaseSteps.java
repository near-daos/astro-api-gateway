package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.utils.JsonUtils;
import io.qameta.allure.Step;
import org.assertj.core.api.AssertionsForInterfaceTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

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

    @Step("User sees collection has size greater than '{greaterThanValue}'")
    public void assertCollectionHasSizeGreaterThan(Collection<?> actual, int greaterThanValue) {
        assertThat(actual.size())
                .as("Collection should have correct size.")
                .isGreaterThanOrEqualTo(greaterThanValue);
    }

    @Step("User sees valid '{fieldName}' contains '{expectedValue}' value")
    public <T> void assertDtoContainsValue(T dto, Function<T, String> valueExtractor,
                                           String expectedValue, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field must contain value.", fieldName))
                .containsIgnoringCase(expectedValue);
    }

    @Step("User sees '{fieldName}' filed has value")
    public <T, V> void assertDtoHasValue(T dto, Function<T, V> valueExtractor, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field must contain value.", fieldName))
                .isNotNull();
    }

    @Step("User sees '{fieldName}' field has '{expectedValue}' value")
    public <T, D> void assertDtoValue(T dto, Function<T, D> valueExtractor,
                                      D expectedValue, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field must contain value.", fieldName))
                .isEqualTo(expectedValue);
    }

    @Step("User sees '{fieldName}' field has value greater than '{value}' value")
    public <T, Integer> void assertDtoValueGreaterThan(T dto, Function<T, Integer> valueExtractor,
                                                       Integer value, String fieldName) {
        assertThat((int) valueExtractor.apply(dto))
                .as(String.format("'%s' field value must be greater than '%s'.", fieldName, value))
                .isGreaterThan((int) value);
    }

    @Step("User sees '{fieldName}' field has value greater than or equal to '{value}' value")
    public <T, Integer> void assertDtoValueGreaterThanOrEqualTo(T dto, Function<T, Integer> valueExtractor,
                                                       Integer value, String fieldName) {
        assertThat((int) valueExtractor.apply(dto))
                .as(String.format("'%s' field value must be greater than '%s'.", fieldName, value))
                .isGreaterThanOrEqualTo((int) value);
    }

    @Step("User sees '{fieldName}' field value greater than '{greaterThanValue}' value")
    public <T> void assertDtoValueGreaterThan(T dto, Function<T, String> valueExtractor,
                                              String greaterThanValue, String fieldName) {
        assertThat(Double.valueOf(valueExtractor.apply(dto)))
                .as(String.format("'%s' field value must be greater than '%s'.", fieldName, greaterThanValue))
                .isGreaterThanOrEqualTo(Double.valueOf(greaterThanValue));
    }

    @Step("User sees '{fieldName}' fields has value in a collection")
    public <T> void assertCollectionElementsHasValue(Collection<T> actual,
                                                     Predicate<? super T> predicate, String fieldName) {
        assertThat(actual)
                .as(String.format("'%s' field should have value in collection.", fieldName))
                .filteredOn(predicate)
                .hasSize(actual.size());
    }

    @Step("User sees '{fieldName}' fields value match criteria in a collection")
    public <T> void assertCollectionElementsValue(Collection<T> actual,
                                                     Predicate<? super T> predicate, String fieldName) {
        assertThat(actual)
                .as(String.format("'%s' field should match criteria in a collection.", fieldName))
                .filteredOn(predicate)
                .hasSize(actual.size());
    }

    @Step("User sees '{fieldName}' field has only desired value in collection")
    public <T, D> void assertCollectionElementsContainsOnly(Collection<T> collection,
                                                     Function<T, D> predicate, D expectedValue, String fieldName) {
        List<D> mapped = collection.stream().map(predicate).distinct().collect(Collectors.toList());

        assertThat(mapped)
                .as(String.format("'%s' field should have only one value.", fieldName))
                .hasSize(1);

        assertThat(mapped.get(0))
                .as(String.format("'%s' field should have correct value.", fieldName))
                .isEqualTo(expectedValue);
    }

    @Step("User sees '{fieldName}' field has no value")
    public <T, D> void assertDtoValueIsNull(T dto, Function<T, D> valueExtractor, String fieldName) {
        assertThat(valueExtractor.apply(dto))
                .as(String.format("'%s' field should have no value.", fieldName))
                .isNull();
    }

    @Step("User sees string contains value")
    public void assertStringContainsValue(String value, String expectedValue) {
        assertThat(value)
                .as("String should contain value.")
                .contains(expectedValue);
    }

    public <T> T getResponseDto(ResponseEntity<String> entity, Class<T> clazz) {
        return JsonUtils.readValue(entity.getBody(), clazz);
    }
}
