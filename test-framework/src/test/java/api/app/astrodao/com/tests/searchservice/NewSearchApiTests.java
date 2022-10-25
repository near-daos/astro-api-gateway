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
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getBountyClaimId(), null, "hits/hits/source/bountyClaimId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVoteCounts().getCouncil(), List.of(0, 1, 0), "hits/hits/source/voteCounts/council");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getIsArchived(), Boolean.FALSE, "hits/hits/source/isArchived");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDescription(), proposalDescription, "hits/hits/source/description");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getType(), "Vote", "hits/hits/source/type");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getProposalId(), 29, "hits/hits/source/proposalId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getSubmissionTime(), "1664362112143338406", "hits/hits/source/submissionTime");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getTransactionHash(), "3xPS4NZ2YS6h62ZyANMw7Y2CwU4HSZk4Uemf3CxfZGcB", "hits/hits/source/transactionHash");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getCreateTimestamp(), "1664362112143338405", "hits/hits/source/createTimestamp");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getId(), proposalId, "hits/hits/source/id");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getBountyDoneId(), null, "hits/hits/source/bountyDoneId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getPolicyLabel(), "vote", "hits/hits/source/policyLabel");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getPartitionId(), daoId, "hits/hits/source/partitionId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getEntityType(), "Proposal", "hits/hits/source/entityType");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getKind().getType(), "Vote", "hits/hits/source/kind/type");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getProposer(), account2Id, "hits/hits/source/proposer");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getUpdateTransactionHash(), "9rq9Zgwn4kEt1YXzeVVtNcxE5FGJPiViYN1zqF2DHcEr", "hits/hits/source/updateTransactionHash");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getEntityId(), "Proposal:29", "hits/hits/source/entityId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVoteStatus(), "Active", "hits/hits/source/voteStatus");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVotePeriodEnd(), "1664362364143338500", "hits/hits/source/votePeriodEnd");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getUpdateTimestamp(), "1664362151057000000", "hits/hits/source/updateTimestamp");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getCommentsCount(), 0, "hits/hits/source/commentsCount");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getFailure(), null, "hits/hits/source/failure");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getVotes(), "{\"automation-01.testnet\":\"Reject\"}", "hits/hits/source/votes");

		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getActions(), actionsItem -> actionsItem.getAccountId().equals(account2Id), "hits/hits/source/actions/accountId", "equals to " + account2Id);
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getActions(), actionsItem -> !actionsItem.getAction().isEmpty(), "hits/hits/source/actions/action", "not empty");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getActions(), actionsItem -> !actionsItem.getId().isEmpty(), "hits/hits/source/actions/id", "not empty");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getActions(), actionsItem -> actionsItem.getProposalId().equals(daoId + "-29"), "hits/hits/source/actions/proposalId", "equals to " + daoId + "-29");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getActions(), actionsItem -> !actionsItem.getTransactionHash().isEmpty(), "hits/hits/source/actions/transactionHash", "not empty");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getActions(), actionsItem -> !actionsItem.getTimestamp().isEmpty(), "hits/hits/source/actions/timestamp", "not empty");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getStatus(), "Rejected", "hits/hits/source/status");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getIndex(), "proposal", "hits/hits/source/index");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getIndexedBy(), "Enrichment Lambda", "hits/hits/source/indexBy");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getAccounts(), "automation-01 automation-01.testnet", "hits/hits/source/accounts");


		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTotalDaoFunds() >= 10.0, "hits/hits/source/dao/TotalDaoFunds");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> !hitsItem.getSource().getDao().getConfig().getMetadata().isEmpty(), "hits/hits/source/dao/config/metadata");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getMetadata().getLegal().getLegalLink().isEmpty(), "hits/hits/source/dao/metadata/legal/legalLink");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getMetadata().getLegal().getLegalStatus().isEmpty(), "hits/hits/source/dao/metadata/legal/legalStatus");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getMetadata().getFlagLogo().isEmpty(), "hits/hits/source/dao/metadata/flagLogo");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getMetadata().getFlagCover().isEmpty(), "hits/hits/source/dao/metadata/flagCover");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getMetadata().getDisplayName(), "Test DAO for UI uno", "hits/hits/source/dao/metadata/displayName");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getMetadata().getLinks().isEmpty(), "hits/hits/source/dao/metadata/links");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getEntityType(), "Dao", "hits/hits/source/dao/entityType");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getStatus(), "Inactive", "hits/hits/source/dao/status");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCouncilSeats(), 1, "hits/hits/source/dao/councilSeats");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getUpdateTransactionHash(), "9rq9Zgwn4kEt1YXzeVVtNcxE5FGJPiViYN1zqF2DHcEr", "hits/hits/source/dao/updateTransactionHash");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTotalProposalCount() >= 30, "hits/hits/source/dao/totalProposalCount");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCreatedBy(), account2Id, "hits/hits/source/dao/createdBy");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getAccountIds(), List.of(account2Id), "hits/hits/source/dao/accountIds");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getLastProposalId() >= 29, "hits/hits/source/dao/lastProposalId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getNumberOfAssociates(), 1, "hits/hits/source/dao/numberOfAssociates");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getActiveProposalCount() >= 0, "hits/hits/source/dao/activeProposalCount");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTotalSupply(), "0", "hits/hits/source/dao/amount");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getNumberOfMembers(), 1, "hits/hits/source/dao/numberOfMembers");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDelegations().isEmpty(), "hits/hits/source/dao/delegations");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getUpdateTimestamp(), "1664362151057000000", "hits/hits/source/dao/updateTimestamp");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCreateTimestamp(), "1652468065998430469", "hits/hits/source/dao/createTimestamp");

		newSearchApiSteps.assertCollectionHasExpectedSize(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy(), 1, "hits/hits/source/dao/policy");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getProposalBond(), "100000000000000000000000", "hits/hits/source/dao/policy/proposalBond");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getProposalPeriod(), "252000000000", "hits/hits/source/dao/policy/proposalPeriod");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getBountyForgivenessPeriod(), "252000000000", "hits/hits/source/dao/policy/bountyForgivenessPeriod");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getBountyBond(), "100000000000000000000000", "hits/hits/source/dao/policy/bountyBond");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getDefaultVotePolicy().getWeightKind(), "RoleWeight", "hits/hits/source/dao/policy/defaultVotePolicy/weightKind");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getDefaultVotePolicy().getKind(), "Ratio", "hits/hits/source/dao/policy/defaultVotePolicy/kind");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getDefaultVotePolicy().getQuorum(), "0", "hits/hits/source/dao/policy/defaultVotePolicy/quorum");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getDefaultVotePolicy().getRatio(), List.of(1, 2), "hits/hits/source/dao/policy/defaultVotePolicy/ratio");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles().size(), 2, "hits/hits/source/dao/policy/roles");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles(), rolesItem -> rolesItem.getBalance() == null, "hits/hits/source/dao/policy/roles/balance", "equals null");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles(), rolesItem -> !rolesItem.getKind().isEmpty(), "hits/hits/source/dao/policy/roles/kind", "not empty");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles(), rolesItem -> !rolesItem.getPermissions().isEmpty(), "hits/hits/source/dao/policy/roles/permissions", "not empty");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles(), rolesItem -> !rolesItem.getName().isEmpty(), "hits/hits/source/dao/policy/roles/name", "not empty");
		//todo newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles(), rolesItem -> rolesItem.getVotePolicy().isEmpty(), "hits/hits/source/dao/policy/roles/votePolicy", "is empty");
		newSearchApiSteps.assertDeepCollectionElementsMatchCondition(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getPolicy().getRoles(), rolesItem -> rolesItem.getId().startsWith(daoId), "hits/hits/source/dao/policy/roles/id", "starts with");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getIsArchived(), Boolean.FALSE, "hits/hits/source/dao/isArchived");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getConfig().getName(), "test-dao-for-ui-uno", "hits/hits/source/dao/config/name");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getConfig().getPurpose().isEmpty(), "hits/hits/source/dao/config/purpose");
		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> !hitsItem.getSource().getDao().getConfig().getMetadata().isEmpty(), "hits/hits/source/dao/config/metadata");

		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getEntityId(), "Dao:" + daoId, "hits/hits/source/dao/daoId");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getStakingContract().isEmpty(), "hits/hits/source/dao/stakingContract");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDaoVersion().getCommitId(), "640495ba572345ca356376989738fbd5462e1ff8", "hits/hits/source/dao/daoVersion/commitId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDaoVersion().getVersion(), List.of(3, 0), "hits/hits/source/dao/daoVersion/version");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDaoVersion().getHash(), "783vth3Fg8MBBGGFmRqrytQCWBpYzUcmHoCq4Mo8QqF5", "hits/hits/source/dao/daoVersion/hash");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDaoVersion().getChangelogUrl(), null, "hits/hits/source/dao/daoVersion/changelogUrl");

		newSearchApiSteps.assertCollectionElementsHasValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getLastBountyId() >= 2, "hits/hits/source/dao/lastBountyId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getCouncil(), List.of(account2Id), "hits/hits/source/dao/council");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getAmount(), "8803911502317504000000000", "hits/hits/source/dao/amount");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getLink().isEmpty(), "hits/hits/source/dao/link");
		newSearchApiSteps.assertCollectionElementsHasNoValue(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getDescription().isEmpty(), "hits/hits/source/dao/description");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getNumberOfGroups(), 1, "hits/hits/source/dao/numberOfGroups");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getTransactionHash(), "Hn3jpUuWHRDU9UZEQ2RGyxRizrV8HAHquKkMGRJmNspn", "hits/hits/source/dao/transactionHash");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getIndex(), "dao", "hits/hits/source/dao/index");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getIndexedBy(), "Enrichment Lambda", "hits/hits/source/dao/indexBy");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getAccounts(), "automation-01", "hits/hits/source/dao/accounts");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getId(), daoId, "hits/hits/source/dao/daoId");
		newSearchApiSteps.assertCollectionContainsOnly(searchResponse.getHits().getHits(), hitsItem -> hitsItem.getSource().getDao().getName(), "Test DAO for UI uno", "hits/hits/source/dao/name");
	}
}
