/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	__experimentalNavigation as Navigation,
	__experimentalNavigationMenu as NavigationMenu,
	__experimentalNavigationItem as NavigationItem,
	Modal,
	TabPanel,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useCallback, useState } from '@wordpress/element';
import {
	PostTaxonomies,
	PostExcerptCheck,
	PageAttributesCheck,
	PostFeaturedImageCheck,
	PostTypeSupportCheck,
	store as editorStore,
} from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import BlockManager from '../manage-blocks-modal/manager';
import Section from './section';
import {
	EnablePluginDocumentSettingPanelOption,
	EnablePublishSidebarOption,
	EnablePanelOption,
	EnableFeature,
} from './options';
import MetaBoxesSection from './meta-boxes-section';
import { store as editPostStore } from '../../store';

const MODAL_NAME = 'edit-post/preferences';

export default function PreferencesModal() {
	const isLargeViewport = useViewportMatch( 'medium' );
	const { closeModal } = useDispatch( editPostStore );
	const { isModalActive, isViewable, showBlockBreadcrumbs } = useSelect(
		( select ) => {
			const { getEditedPostAttribute, getEditorSettings } = select(
				editorStore
			);
			const { getPostType } = select( coreStore );
			const {
				isModalActive: _isModalActive,
				getEditorMode,
				isFeatureActive,
			} = select( editPostStore );
			const mode = getEditorMode();
			const { isRichEditingEnabled } = getEditorSettings();
			const hasReducedUI = isFeatureActive( 'reducedUI' );
			const postType = getPostType( getEditedPostAttribute( 'type' ) );
			return {
				isModalActive: _isModalActive( MODAL_NAME ),
				isViewable: get( postType, [ 'viewable' ], false ),
				showBlockBreadcrumbs:
					! hasReducedUI &&
					isLargeViewport &&
					isRichEditingEnabled &&
					mode === 'visual',
			};
		},
		[]
	);
	const sections = useMemo(
		() => [
			{
				name: 'general',
				tabLabel: __( 'General' ),
				content: (
					<>
						<Section title={ __( 'Choose your own experience' ) }>
							<EnablePublishSidebarOption
								help={ __(
									'Review settings such as categories and tags.'
								) }
								label={ __( 'Include pre-publish checklist' ) }
							/>
						</Section>
						<Section title={ __( 'Decide what to focus on' ) }>
							<EnableFeature
								featureName="reducedUI"
								help={ __(
									'Compacts options and outlines in the toolbar.'
								) }
								label={ __( 'Reduce the interface' ) }
							/>
							<EnableFeature
								featureName="focusMode"
								help={ __(
									'Highlights the current block and fades other content.'
								) }
								label={ __( 'Spotlight mode' ) }
							/>
							{ showBlockBreadcrumbs && (
								<EnableFeature
									featureName="showBlockBreadcrumbs"
									help={ __(
										'Shows block breadcrumbs at the bottom of the editor.'
									) }
									label={ __( 'Display block breadcrumbs' ) }
								/>
							) }
						</Section>
					</>
				),
			},
			{
				name: 'appearance',
				tabLabel: __( 'Appearance' ),
				content: (
					<Section title={ __( 'Choose the way it looks' ) }>
						<EnableFeature
							featureName="showIconLabels"
							help={ __(
								'Shows text instead of icons in toolbar.'
							) }
							label={ __( 'Display button labels' ) }
						/>
						<EnableFeature
							featureName="themeStyles"
							help={ __(
								'Make the editor look like your theme.'
							) }
							label={ __( 'Use theme styles' ) }
						/>
					</Section>
				),
			},
			{
				name: 'blocks',
				tabLabel: __( 'Blocks' ),
				content: (
					<Section
						title={ __( 'Choose how you interact with blocks' ) }
					>
						<EnableFeature
							featureName="mostUsedBlocks"
							help={ __(
								'Places the most frequent blocks in the block library.'
							) }
							label={ __( 'Show most used blocks' ) }
						/>
						<EnableFeature
							featureName="keepCaretInsideBlock"
							help={ __(
								'Aids screen readers by stopping text caret from leaving blocks.'
							) }
							label={ __( 'Contain text cursor inside block' ) }
						/>
					</Section>
				),
			},
			{
				name: 'block-manager',
				tabLabel: __( 'Block Manager' ),
				content: (
					<Section title={ __( 'Decide what blocks to show' ) }>
						<BlockManager />
					</Section>
				),
			},
			{
				name: 'panels',
				tabLabel: __( 'Panels' ),
				content: (
					<>
						<Section
							title={ __( 'Document settings' ) }
							description={ __(
								'Choose what displays in the panel.'
							) }
						>
							<EnablePluginDocumentSettingPanelOption.Slot />
							{ isViewable && (
								<EnablePanelOption
									label={ __( 'Permalink' ) }
									panelName="post-link"
								/>
							) }
							<PostTaxonomies
								taxonomyWrapper={ ( content, taxonomy ) => (
									<EnablePanelOption
										label={ get( taxonomy, [
											'labels',
											'menu_name',
										] ) }
										panelName={ `taxonomy-panel-${ taxonomy.slug }` }
									/>
								) }
							/>
							<PostFeaturedImageCheck>
								<EnablePanelOption
									label={ __( 'Featured image' ) }
									panelName="featured-image"
								/>
							</PostFeaturedImageCheck>
							<PostExcerptCheck>
								<EnablePanelOption
									label={ __( 'Excerpt' ) }
									panelName="post-excerpt"
								/>
							</PostExcerptCheck>
							<PostTypeSupportCheck
								supportKeys={ [ 'comments', 'trackbacks' ] }
							>
								<EnablePanelOption
									label={ __( 'Discussion' ) }
									panelName="discussion-panel"
								/>
							</PostTypeSupportCheck>
							<PageAttributesCheck>
								<EnablePanelOption
									label={ __( 'Page attributes' ) }
									panelName="page-attributes"
								/>
							</PageAttributesCheck>
						</Section>
						<Section
							title={ __( 'Additional' ) }
							description={ __(
								'Add extra areas to the editor.'
							) }
						>
							<MetaBoxesSection />
						</Section>
					</>
				),
			},
		],
		[ isViewable, showBlockBreadcrumbs ]
	);
	const preferencesMenu = 'preferences-menu';
	const [ activeTab ] = useState();
	const [ activeMenu, setActiveMenu ] = useState( preferencesMenu );
	/**
	 * Create helper objects from `sections` for easier data handling.
	 * `tabs` is used for creating the `TabPanel` and `sectionsContentMap`
	 * is used for easier access to active tab's content.
	 */
	const { tabs, sectionsContentMap } = useMemo(
		() =>
			sections.reduce(
				( accumulator, { name, tabLabel: title, content } ) => {
					accumulator.tabs.push( { name, title } );
					accumulator.sectionsContentMap[ name ] = content;
					return accumulator;
				},
				{ tabs: [], sectionsContentMap: {} }
			),
		[ sections ]
	);
	const getCurrentTab = useCallback(
		( tab ) => sectionsContentMap[ tab.name ] || null,
		[ sectionsContentMap ]
	);
	if ( ! isModalActive ) {
		return null;
	}
	let modalContent = (
		<TabPanel
			className="edit-post-preferences__tabs"
			tabs={ tabs }
			orientation="vertical"
		>
			{ getCurrentTab }
		</TabPanel>
	);
	if ( ! isLargeViewport ) {
		modalContent = (
			<Navigation
				activeItem={ activeTab }
				activeMenu={ activeMenu }
				onActivateMenu={ setActiveMenu }
			>
				<NavigationMenu menu={ preferencesMenu }>
					{ tabs.map( ( tab ) => {
						return (
							<NavigationItem
								key={ tab.name }
								title={ tab.title }
								navigateToMenu={ tab.name }
							/>
						);
					} ) }
				</NavigationMenu>
				{ sections.map( ( section ) => {
					return (
						<NavigationMenu
							key={ `${ section.name }-menu` }
							menu={ section.name }
							title={ section.tabLabel }
							parentMenu={ preferencesMenu }
						>
							<NavigationItem>{ section.content }</NavigationItem>
						</NavigationMenu>
					);
				} ) }
			</Navigation>
		);
	}
	return (
		<Modal
			className="edit-post-preferences-modal"
			title={ __( 'Preferences' ) }
			closeLabel={ __( 'Close' ) }
			onRequestClose={ closeModal }
		>
			<div className="edit-post-preferences-modal__content">
				{ modalContent }
			</div>
		</Modal>
	);
}
