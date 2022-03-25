package api.app.astrodao.com.tests.token;

import api.app.astrodao.com.core.dto.api.tokens.TokensList;
import api.app.astrodao.com.openapi.models.Token;
import api.app.astrodao.com.steps.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("tokensApiTests"), @Tag("accountTokensApiTests")})
@Epic("Token")
@Feature("/tokens/account-tokens/{accountId} API tests")
@DisplayName("/tokens/account-tokens/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountTokensApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Value("${test.dao1}")
	private String testDao;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of token for valid DAO")
	@DisplayName("Get list of token for valid DAO")
	void getListOfTokensForValidDao() {
		TokensList tokensList = tokenApiSteps.getTokensForDao(testDao).then()
				.statusCode(HTTP_OK)
				.extract().as(TokensList.class);

		tokenApiSteps.assertCollectionHasCorrectSize(tokensList, 1);
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getId, "NEAR", "id");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getSymbol, "NEAR", "symbol");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getDecimals, BigDecimal.valueOf(24), "decimals");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getPrice().isBlank(), "price");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getBalance().isBlank(), "balance");
	}

	@Test
	@Disabled("Getting INTERNAL_SERVER_ERROR instead of BAD_REQUEST")
	@Issue("https://github.com/near-daos/astro-api-gateway/issues/198")
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of token for valid DAO")
	@DisplayName("Get list of token for valid DAO")
	void getListOfTokensForInvalidDao() {
		Response response = tokenApiSteps.getTokensForDao("wqeqrrr.sputnikv2.testnet");

		tokenApiSteps.assertResponseStatusCode(response, HTTP_BAD_REQUEST);
	}
}
