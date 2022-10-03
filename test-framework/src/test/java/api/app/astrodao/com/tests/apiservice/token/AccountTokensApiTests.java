package api.app.astrodao.com.tests.apiservice.token;

import api.app.astrodao.com.core.dto.api.tokens.TokensList;
import api.app.astrodao.com.openapi.models.Token;
import api.app.astrodao.com.steps.apiservice.TokenApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("tokensApiTests"), @Tag("accountTokensApiTests")})
@Epic("Token")
@Feature("/tokens/account-tokens/{accountId} API tests")
@DisplayName("/tokens/account-tokens/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountTokensApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get token list for valid accountId query parameter '{id}'")
	@DisplayName("Get token list for valid accountId query parameter '{id}'")
	void getTokenListForValidDaoIdQueryParam() {
		String daoId = "test-dao-1641395769436.sputnikv2.testnet";
		TokensList tokensList = tokenApiSteps.getTokensForDao(daoId).then()
				.statusCode(HTTP_OK)
				.extract().as(TokensList.class);

		tokenApiSteps.assertCollectionHasCorrectSize(tokensList, 1);
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getId, "NEAR", "id");
		tokenApiSteps.assertCollectionElementsHasNoValue(tokensList, token -> token.getTotalSupply().isEmpty(), "totalSupply");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getDecimals, BigDecimal.valueOf(24), "decimals");
		tokenApiSteps.assertDtoValueIsNull(tokensList.get(0), Token::getIcon, "icon");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getSymbol, "NEAR", "symbol");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getPrice().isBlank(), "price");
		tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getBalance().isBlank(), "balance");
		tokenApiSteps.assertCollectionElementsHasNoValue(tokensList, r -> r.getTokenId().isBlank(), "tokenId");
	}

}
