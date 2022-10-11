package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.utils.JsonUtils;
import io.qameta.allure.Step;
import io.restassured.response.Response;
import org.assertj.core.api.AssertionsForInterfaceTypes;
import org.assertj.core.api.iterable.ThrowingExtractor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.function.Predicate;

import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

public abstract class BaseSteps {

    @Step("Verify http status code is correct")
    public void assertResponseStatusCode(Response actual, int status) {
        assertThat(actual.getStatusCode())
                .as("http status code should be correct.")
                .isEqualTo(status);
    }

    @Step("User sees collection has correct size")
    public void assertCollectionHasCorrectSize(Collection<?> actual, int expectedSize) {
        assertThat(actual.size())
                .as("Collection should have correct size.")
                .isEqualTo(expectedSize);
    }

    @Step("User sees collection has correct size")
    public <T, D> void assertCollectionHasExpectedSize(Collection<T> actual, Function<T, D> predicate,
                                                       int expectedSize, String fieldName) {

        List<D> mapped = actual.stream().map(predicate).collect(toList());

        assertThat(mapped)
                .as("Collection '%s' should have expected size", fieldName)
                .hasSize(expectedSize);
    }

    @Step("User sees collection are the same (regardless of order)")
    public void assertCollectionsAreEqual(List<String> actual, List<String> expected) {
        AssertionsForInterfaceTypes.assertThat(actual)
                .as("Collection should have the same elements.")
                .containsExactlyInAnyOrder(expected.toArray(String[]::new));
    }

    @Step("User sees collection has size greater than '{greaterThanValue}'")
    public void assertCollectionHasSizeGreaterThanOrEqualTo(Collection<?> actual, int greaterThanValue) {
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

    @Step("User sees '{fieldName}' field value greater than or equal to '{greaterThanValue}' value")
    public <T> void assertDtoValueIsGreaterThanOrEqualTo(T dto, Function<T, String> valueExtractor,
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

    @Step("User sees fields '{fieldName}' filtered by condition '{condition}' have value in a collection")
    public <T, D> void assertDeepCollectionElementsHasValue(Collection<T> actual,
                                                            ThrowingExtractor<? super T, ? extends Collection<D>, ?> extractor,
                                                            Predicate<? super D> predicate,
                                                            String fieldName, String condition) {
        assertThat(actual)
                .as(String.format("Field '%s' filtered by condition '%s' have no value in collection.", fieldName, condition))
                .flatExtracting(extractor).filteredOn(predicate)
                .hasSize(actual.size());
    }

    @Step("User sees '{fieldName}' fields has no value in a collection")
    public <T> void assertCollectionElementsHasNoValue(Collection<T> actual,
                                                     Predicate<? super T> predicate, String fieldName) {
        assertThat(actual)
                .as(String.format("'%s' field should have value in collection.", fieldName))
                .filteredOn(predicate)
                .hasSize(actual.size());
    }

    @Step("User sees that fields '{fieldName}' has boolean value in a collection")
    public <T> void assertCollectionElementsHasBooleanValueAndSize(Collection<T> actual,
                                                     Predicate<? super T> predicate, String errorMessage,
                                                                   String fieldName) {
        assertThat(actual)
                .as("%s " + "'%s'", errorMessage, fieldName)
                .filteredOn(predicate)
                .hasSize(actual.size());
    }

    @Step("User sees '{fieldName}' field has only desired value in collection")
    public <T, D> void assertCollectionContainsOnly(Collection<T> collection,
                                                    Function<T, D> predicate, D expectedValue, String fieldName) {
        List<D> mapped = collection.stream().map(predicate).distinct().collect(toList());

        assertThat(mapped)
                .as(String.format("'%s' field should have only one value.", fieldName))
                .hasSize(1);

        assertThat(mapped.get(0))
                .as(String.format("'%s' field should have correct value.", fieldName))
                .isEqualTo(expectedValue);
    }

    @Step("User sees collection contains only desired values")
    public <T, D> void assertCollectionContainsExactlyInAnyOrder(Collection<T> collection, Function<T, D> predicate,
                                                                 D... expectedElements) {
        List<D> actualCollection = collection.stream().map(predicate).collect(toList());
        List<D> distinctCollection = actualCollection.stream().distinct().collect(toList());

        assertThat(distinctCollection)
                .as("Collection should contain only following elements: '%s'", Arrays.asList(expectedElements))
                .containsExactlyInAnyOrder(expectedElements);
    }

    @Step("User sees collection by field '{fieldName}' contains only desired values")
    public <T, D> void assertCollectionHasSameElementsAs(Collection<T> collection, Function<T, D> predicate,
                                                                 List expectedElements, String fieldName) {
        List<D> actualCollection = collection.stream().map(predicate).collect(toList());
        List<D> distinctCollection = actualCollection.stream().distinct().collect(toList());

        assertThat(distinctCollection)
                .as("Collection by field '%s' should contain only following elements: '%s'", fieldName, expectedElements)
                .hasSameElementsAs(expectedElements);
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

    public <T> T getResponseDto(Response response, Class<T> clazz) {
        return JsonUtils.readValue(response.body().asString(), clazz);
    }

    @Step("User sees collection is sorted correctly")
    public void assertOffsetDateTimesAreSortedCorrectly(Collection<OffsetDateTime> original,
                                                        Comparator<? super OffsetDateTime> comparator,
                                                        String assertMsg) {
        ArrayList<OffsetDateTime> sorted = new ArrayList<>(original);
        sorted.sort(comparator);

        assertThat(original)
                .as(assertMsg)
                .containsExactlyElementsOf(sorted);
    }

    @Step("User sees collection is sorted correctly")
    public void assertStringsAreSortedCorrectly(Collection<String> original,
                                                  Comparator<? super String> comparator,
                                                  String assertMsg) {
        ArrayList<String> sorted = new ArrayList<>(original);
        sorted.sort(comparator);

        assertThat(original)
                .as(assertMsg)
                .containsExactlyElementsOf(sorted);
    }

    @Step("User sees collection is sorted correctly")
    public void assertBigDecimalsAreSortedCorrectly(Collection<BigDecimal> original,
                                                  Comparator<? super BigDecimal> comparator,
                                                  String assertMsg) {
        ArrayList<BigDecimal> sorted = new ArrayList<>(original);
        sorted.sort(comparator);

        assertThat(original)
                .as(assertMsg)
                .containsExactlyElementsOf(sorted);
    }
}
