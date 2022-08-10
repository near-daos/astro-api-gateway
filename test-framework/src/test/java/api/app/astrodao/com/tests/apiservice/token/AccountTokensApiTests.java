package api.app.astrodao.com.tests.apiservice.token;

import api.app.astrodao.com.core.dto.api.tokens.TokensList;
import api.app.astrodao.com.openapi.models.Token;
import api.app.astrodao.com.steps.apiservice.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("tokensApiTests"), @Tag("accountTokensApiTests")})
@Epic("Token")
@Feature("/tokens/account-tokens/{accountId} API tests")
@DisplayName("/tokens/account-tokens/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountTokensApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get token list for valid accountId query parameter '{id}'")
	@DisplayName("Get token list for valid accountId query parameter '{id}'")
	@CsvSource({"test-dao-1641395769436.sputnikv2.testnet", "testdao2.testnet"})
	void getTokenListForValidAccountIdQueryParam(String id) {
		TokensList tokensList = tokenApiSteps.getTokensForDao(id).then()
				.statusCode(HTTP_OK)
				.extract().as(TokensList.class);

		tokenApiSteps.assertCollectionHasCorrectSize(tokensList, 1);
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getId, "NEAR", "id");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getSymbol, "NEAR", "symbol");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getDecimals, BigDecimal.valueOf(24), "decimals");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getPrice().isBlank(), "price");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getBalance().isBlank(), "balance");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for account-tokens with invalid DAO")
	@DisplayName("Get HTTP 404 for account-tokens with invalid DAO")
	@CsvSource({"invalidAccountId", "2212332141", "-1", "0", "wqeqrrr.sputnikv2.testnet",
			"*", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForAccountTokensWithIndalidDaoId(String daoId) {
		String errorMessage = String.format("Account does not exist: %s", daoId);

		tokenApiSteps.getTokensForDao(daoId).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Not Found"));
	}
}
