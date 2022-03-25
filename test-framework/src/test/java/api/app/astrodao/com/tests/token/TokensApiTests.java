package api.app.astrodao.com.tests.token;

import api.app.astrodao.com.core.dto.api.tokens.TokensList;
import api.app.astrodao.com.core.enums.HttpStatus;
import api.app.astrodao.com.openapi.models.Token;
import api.app.astrodao.com.openapi.models.TokenResponse;
import api.app.astrodao.com.steps.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Map;

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
    @Story("Get list of tokens with query param: [sort, limit, offset]")
    @DisplayName("Get list of tokens with query param: [sort, limit, offset]")
    void getListOfTokensWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;

        TokenResponse tokenResponse = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokenResponse.class);

        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), limit, "total");
        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getCount().intValue(), limit, "limit");
        tokenApiSteps.assertCollectionHasCorrectSize(tokenResponse.getData(), limit);
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getSymbol().isBlank(), "symbol");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, page]")
    @DisplayName("Get list of DAOs with query param: [sort, page]")
    void getListOfTokensWithSortPageParams() {
        //TODO: Need to clarify this case
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );

        TokensList tokensList = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getSymbol().isBlank(), "symbol");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, fields]")
    @DisplayName("Get list of tokens with query param: [sort, fields]")
    void getListOfTokensWithSortFieldsParams() {
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,symbol"
        );

        TokensList tokensList = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getSymbol().isBlank(), "symbol");
        //TODO: add verification that other fields are null
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, s]")
    @DisplayName("Get list of tokens with query param: [sort, s]")
    void getListOfTokensWithSortAndSParams() {
        int decimals = 18;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"decimals\": %s}", decimals)
        );

        TokensList tokensList = tokenApiSteps.getTokens(query).then()
                .statusCode(HTTP_OK)
                .extract().as(TokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThanOrEqualTo(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getSymbol().isBlank(), "symbol");
        tokenApiSteps.assertCollectionContainsOnly(tokensList, Token::getDecimals, BigDecimal.valueOf(decimals), "decimals");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to get tokens for request with invalid params")
    @DisplayName("User should not be able to get tokens for request with invalid params")
    void userShouldNotBeAbleToGetTokensForRequestWithInvalidParams() {
        Map<String, Object> query = Map.of(
                "limit","-1"
        );
        String expectedResponse = "LIMIT must not be negative";

        Response response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HTTP_BAD_REQUEST);
        tokenApiSteps.assertStringContainsValue(response.body().asString(), expectedResponse);
    }

}