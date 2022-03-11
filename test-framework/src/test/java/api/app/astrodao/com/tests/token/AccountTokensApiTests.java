package api.app.astrodao.com.tests.token;

import api.app.astrodao.com.core.dto.api.tokens.TokensList;
import api.app.astrodao.com.openapi.models.Token;
import api.app.astrodao.com.steps.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

@Tags({@Tag("all"), @Tag("accountTokensApiTests")})
@Epic("Token")
@Feature("/tokens/account-tokens/{accountId} API tests")
@DisplayName("/tokens/account-tokens/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountTokensApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Value("${test.dao}")
	private String testDao;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of token for valid DAO")
	@DisplayName("Get list of token for valid DAO")
	void getListOfTokensForValidDao() {
		ResponseEntity<String> response = tokenApiSteps.getTokensForDao(testDao);
		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		TokensList tokensList = tokenApiSteps.getResponseDto(response, TokensList.class);

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
		ResponseEntity<String> response = tokenApiSteps.getTokensForDao("wqeqrrr.sputnikv2.testnet");

		tokenApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
	}
}
