package api.app.astrodao.com.tests.searchservice;

import api.app.astrodao.com.core.controllers.newsearch.enums.SearchRequestPathEnum;
import api.app.astrodao.com.core.dto.newsearch.request.enums.ProposalFieldsEnum;
import api.app.astrodao.com.core.dto.newsearch.response.HitsItem;
import api.app.astrodao.com.core.dto.newsearch.response.NewSearchResponse;
import api.app.astrodao.com.core.dto.newsearch.response.Total;
import api.app.astrodao.com.steps.newsearch.NewSearchApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("newSearchApiTests")})
@Epic("Search")
@Feature("New search API tests")
@DisplayName("New search API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NewSearchApiTests extends BaseTest {
	private final NewSearchApiSteps newSearchApiSteps;

	@Value("${accounts.account2.accountId}")
	private String account2Id;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Search for proposals by 'description' param by total match")
	@DisplayName("Search for proposals by 'description' param by total match")
	void getProposalsSearchResultsByDescriptionParam() {
		String queryString = "\"poll proposal draft1_1\"";
		String daoId = "test-dao-for-ui-uno.sputnikv2.testnet";
		String proposalId = "test-dao-for-ui-uno.sputnikv2.testnet-29";
		String proposalDescription = "poll proposal draft1_1$$$$https://testnet.app.astrodao.com/dao/test-dao-for-ui-uno.sputnikv2.testnet/drafts/633426433b5f700008b15bde$$$$ProposePoll";

		NewSearchResponse searchResponse = newSearchApiSteps.search(
						SearchRequestPathEnum.PROPOSAL,
						List.of(ProposalFieldsEnum.DESCRIPTION.getFieldValue()),
						queryString)
				.then()
				.statusCode(HTTP_OK)
				.extract().as(NewSearchResponse.class);

		newSearchApiSteps.assertDtoValue(searchResponse.getHits().getTotal(), Total::getValue, 1, "hits/total/value");
		newSearchApiSteps.assertDtoValue(searchResponse.getHits().getTotal(), Total::getRelation, "eq", "hits/total/relation");

		newSearchApiSteps.assertCollectionHasCorrectSize(searchResponse.getHits().getHits(), 1);
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), HitsItem::getIndex, "proposal", "hits/hits/index");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), HitsItem::getType, "_doc", "hits/hits/type");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), HitsItem::getId, proposalId, "hits/hits/id");

		newSearchApiSteps.assertCollectionHasExpectedSize(searchResponse.getHits().getHits(), HitsItem::getSource, 1, "hits/hits/source");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getName(), proposalId, "hits/hits/source/name");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDescription(), proposalDescription, "hits/hits/source/description");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getAccounts(), account2Id + " " + account2Id, "hits/hits/source/accounts");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getId(), proposalId, "hits/hits/source/id");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getProposalId(), 29, "hits/hits/source/proposalId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDaoId(), daoId, "hits/hits/source/daoId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getId(), daoId, "hits/hits/source/dao/daoId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getName(), daoId, "hits/hits/source/dao/name");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getAccounts(), account2Id, "hits/hits/source/dao/accounts");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getConfig().getName(), "test-dao-for-ui-uno", "hits/hits/source/dao/config/name");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getConfig().getPurpose().isEmpty(), "hits/hits/source/dao/config/purpose");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> !hitsItem.getSource().getDao().getConfig().getMetadata().isEmpty(), "hits/hits/source/dao/config/metadata");

		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> !hitsItem.getSource().getDao().getMetadata().isEmpty(), "hits/hits/source/dao/metadata");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getAmount(), "8803911502317504000000000", "hits/hits/source/dao/amount");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTotalSupply(), "0", "hits/hits/source/dao/amount");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getLastBountyId() >= 2, "hits/hits/source/dao/lastBountyId");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getLastProposalId() >= 29, "hits/hits/source/dao/lastProposalId");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getStakingContract().isEmpty(), "hits/hits/source/dao/stakingContract");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getNumberOfAssociates(), 1, "hits/hits/source/dao/numberOfAssociates");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getNumberOfMembers(), 1, "hits/hits/source/dao/numberOfMembers");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getNumberOfGroups(), 1, "hits/hits/source/dao/numberOfGroups");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCouncil(), List.of(account2Id), "hits/hits/source/dao/council");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getAccountIds(), List.of(account2Id), "hits/hits/source/dao/accountIds");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCouncilSeats(), 1, "hits/hits/source/dao/councilSeats");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> !hitsItem.getSource().getDao().getPolicy().isEmpty(), "hits/hits/source/dao/policy");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getLink().isEmpty(), "hits/hits/source/dao/link");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDescription().isEmpty(), "hits/hits/source/dao/description");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCreatedBy(), account2Id, "hits/hits/source/dao/createdBy");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDaoVersionHash(), "783vth3Fg8MBBGGFmRqrytQCWBpYzUcmHoCq4Mo8QqF5", "hits/hits/source/dao/daoVersionHash");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> !hitsItem.getSource().getDao().getStatus().isEmpty(), "hits/hits/source/dao/status");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getActiveProposalCount() >= 0, "hits/hits/source/dao/activeProposalCount");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTotalProposalCount() >= 30, "hits/hits/source/dao/totalProposalCount");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTotalDaoFunds() > 20, "hits/hits/source/dao/totalDaoFunds");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTransactionHash(), "Hn3jpUuWHRDU9UZEQ2RGyxRizrV8HAHquKkMGRJmNspn", "hits/hits/source/dao/transactionHash");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCreateTimestamp(), "1652468065998430469", "hits/hits/source/dao/createTimestamp");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getProposer(), account2Id, "hits/hits/source/proposer");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getStatus(), "Rejected", "hits/hits/source/status");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVoteStatus(), "Active", "hits/hits/source/voteStatus");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getType(), "Vote", "hits/hits/source/type");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getPolicyLabel(), "vote", "hits/hits/source/policyLabel");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getSubmissionTime(), "1664362112143338406", "hits/hits/source/submissionTime");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVotes(), "{\"automation-01.testnet\":\"Reject\"}", "hits/hits/source/votes");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getFailure(), null, "hits/hits/source/failure");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVotePeriodEnd(), "1664362364143338500", "hits/hits/source/votePeriodEnd");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getBountyDoneId(), null, "hits/hits/source/bountyDoneId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getBountyClaimId(), null, "hits/hits/source/bountyClaimId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getCommentsCount(), 0, "hits/hits/source/commentsCount");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getTransactionHash(), "3xPS4NZ2YS6h62ZyANMw7Y2CwU4HSZk4Uemf3CxfZGcB", "hits/hits/source/transactionHash");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getCreateTimestamp(), "1664362112143338405", "hits/hits/source/createTimestamp");
	}
}
