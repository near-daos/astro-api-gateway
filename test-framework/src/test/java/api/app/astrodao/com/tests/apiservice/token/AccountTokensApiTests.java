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
@Feature("/tokens/account-tokens/{accountId}/tokens/account-tokens/{accountId} API tests")
@DisplayName("/tokens/account-tokens/{accountId} API tests")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AccountTokensApiTests extends BaseTest {
	private final TokenApiSteps tokenApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get a single token list for valid accountId query parameter '{id}'")
	@DisplayName("Get a single token list for valid accountId query parameter '{id}'")
	void getSingleTokenListForValidDaoIdQueryParam() {
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

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of tokens for valid accountId query parameter '{id}'")
	@DisplayName("Get token list for valid accountId query parameter '{id}'")
	void getListOfTokensForValidDaoIdQueryParam() {
		TokensList tokensList = tokenApiSteps.getTokensForDao("ref-finance.sputnikv2.testnet").then()
				.statusCode(HTTP_OK)
				.extract().as(TokensList.class);

		tokenApiSteps.assertCollectionHasCorrectSize(tokensList, 4);
		tokenApiSteps.assertCollectionContainsExactlyInAnyOrder(tokensList, Token::getId, "NEAR", "paras.fakes.testnet", "rft.tokenfactory.testnet", "ref.fakes.testnet");

		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getId, "NEAR", "id");
		tokenApiSteps.assertDtoHasValue(tokensList.get(0), token -> token.getTotalSupply().isEmpty(), "totalSupply");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getDecimals, BigDecimal.valueOf(24), "decimals");
		tokenApiSteps.assertDtoValueIsNull(tokensList.get(0), Token::getIcon, "icon");
		tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getSymbol, "NEAR", "symbol");
		tokenApiSteps.assertDtoHasValue(tokensList.get(0), r -> !r.getPrice().isBlank(), "price");
		tokenApiSteps.assertDtoHasValue(tokensList.get(0), r -> !r.getBalance().isBlank(), "balance");
		tokenApiSteps.assertDtoHasValue(tokensList.get(0), r -> r.getTokenId().isBlank(), "tokenId");

		tokenApiSteps.assertDtoValue(tokensList.get(1), Token::getId, "paras.fakes.testnet", "id");
		tokenApiSteps.assertDtoValue(tokensList.get(1), Token::getTotalSupply, "584387744597502521875721184", "totalSupply");
		tokenApiSteps.assertDtoValue(tokensList.get(1), Token::getDecimals, BigDecimal.valueOf(18), "decimals");
		tokenApiSteps.assertDtoHasValue(tokensList.get(1), token -> !token.getIcon().isEmpty(), "icon");
		tokenApiSteps.assertDtoValue(tokensList.get(1), Token::getSymbol, "PARAS", "symbol");
		tokenApiSteps.assertDtoValueIsNull(tokensList.get(1), Token::getPrice, "price");
		tokenApiSteps.assertDtoValue(tokensList.get(1), Token::getTokenId, "paras.fakes.testnet", "tokenId");
		tokenApiSteps.assertDtoValue(tokensList.get(1), Token::getBalance, "12345678900000000000000000", "balance");

		tokenApiSteps.assertDtoValue(tokensList.get(2), Token::getId, "rft.tokenfactory.testnet", "id");
		tokenApiSteps.assertDtoValue(tokensList.get(2), Token::getTotalSupply, "9999999007078293", "totalSupply");
		tokenApiSteps.assertDtoValue(tokensList.get(2), Token::getDecimals, BigDecimal.valueOf(8), "decimals");
		tokenApiSteps.assertDtoHasValue(tokensList.get(2), token -> token.getIcon().isEmpty(), "icon");
		tokenApiSteps.assertDtoValue(tokensList.get(2), Token::getSymbol, "RFT", "symbol");
		tokenApiSteps.assertDtoValueIsNull(tokensList.get(2), Token::getPrice, "price");
		tokenApiSteps.assertDtoValue(tokensList.get(2), Token::getTokenId, "rft.tokenfactory.testnet", "tokenId");
		tokenApiSteps.assertDtoValue(tokensList.get(2), Token::getBalance, "9000000000000000", "balance");

		tokenApiSteps.assertDtoValue(tokensList.get(3), Token::getId, "ref.fakes.testnet", "id");
		tokenApiSteps.assertDtoValue(tokensList.get(3), Token::getTotalSupply, "131312820018812054127218294779", "totalSupply");
		tokenApiSteps.assertDtoValue(tokensList.get(3), Token::getDecimals, BigDecimal.valueOf(18), "decimals");
		tokenApiSteps.assertDtoHasValue(tokensList.get(3), token -> !token.getIcon().isEmpty(), "icon");
		tokenApiSteps.assertDtoValue(tokensList.get(3), Token::getSymbol, "REF", "symbol");
		tokenApiSteps.assertDtoValueIsNull(tokensList.get(3), Token::getPrice, "price");
		tokenApiSteps.assertDtoValue(tokensList.get(3), Token::getTokenId, "ref.fakes.testnet", "tokenId");
		tokenApiSteps.assertDtoValue(tokensList.get(3), Token::getBalance, "0", "balance");
	}
}