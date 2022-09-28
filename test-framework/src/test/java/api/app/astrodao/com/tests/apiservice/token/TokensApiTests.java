package api.app.astrodao.com.tests.apiservice.token;

import api.app.astrodao.com.openapi.models.TokenResponse;
import api.app.astrodao.com.openapi.models.TokensPageResponseDto;
import api.app.astrodao.com.steps.apiservice.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("tokensApiTests"), @Tag("tokensApiTests")})
@Epic("Token")
@Feature("/tokens API tests")
@DisplayName("/tokens API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TokensApiTests extends BaseTest {
    private final TokenApiSteps tokenApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [limit, offset]")
    @DisplayName("Get list of tokens with query param: [limit, offset]")
    void getListOfTokensWithLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "limit", 10,
                "offset", 0
        );
        int limit = 10;

        TokensPageResponseDto tokenResponse = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokensPageResponseDto.class);

        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getLimit().intValue(), limit, "limit");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getOffset().intValue(), 0, "offset");
        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 135, "total");

        tokenApiSteps.assertCollectionHasCorrectSize(tokenResponse.getData(), limit);
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getTotalSupply().isBlank(), "totalSupply");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getSymbol().isBlank(), "symbol");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [orderBy, order]")
    @DisplayName("Get list of tokens with query param: [orderBy, order]")
    void getListOfTokensWithOrderByOrderParams() {
        Map<String, Object> query = Map.of(
                "orderBy", "id",
                "order", "ASC"
        );

        TokensPageResponseDto tokensList = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokensPageResponseDto.class);

        tokenApiSteps.assertDtoValue(tokensList, r -> r.getLimit().intValue(), 10, "limit");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> !r.getTotalSupply().isBlank(), "totalSupply");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> !r.getSymbol().isBlank(), "symbol");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> r.getDecimals().intValue() > 0, "decimals");

        List<String> id = tokensList.getData().stream().map(TokenResponse::getId).collect(Collectors.toList());
        tokenApiSteps.assertStringsAreSortedCorrectly(id, Comparator.naturalOrder(),
                                                                      "List of tokens should be sorted by 'id' field in ASC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [search, orderBy, order]")
    @DisplayName("Get list of tokens with query param: [search, orderBy, order]")
    void getListOfTokensWithSearchOrderByOrderFieldsParams() {
        Map<String, Object> query = Map.of(
                "search", "FT",
                "orderBy", "decimals",
                "order", "DESC"
        );

        TokensPageResponseDto tokensList = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokensPageResponseDto.class);

        tokenApiSteps.assertDtoValue(tokensList, r -> r.getLimit().intValue(), 10, "limit");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> !r.getTotalSupply().isBlank(), "totalSupply");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> !r.getSymbol().isBlank(), "symbol");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList.getData(), r -> r.getDecimals().intValue() > 0, "decimals");

        List<BigDecimal> decimals = tokensList.getData().stream().map(TokenResponse::getDecimals).collect(Collectors.toList());
        tokenApiSteps.assertBigDecimalCollectionIsSortedCorrectly(decimals, Comparator.reverseOrder(),
                                                                  "List of tokens should be sorted by 'decimals' field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.NORMAL)
    @Story("User should not be able to get tokens for request with invalid params")
    @DisplayName("User should not be able to get tokens for request with invalid params")
    void userShouldNotBeAbleToGetTokensForRequestWithInvalidParams() {
        Map<String, Object> query = Map.of(
                "limit", "-1"
        );
        String expectedResponse = "LIMIT must not be negative";

        Response response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HTTP_BAD_REQUEST);
        tokenApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
    }

}